import { defineMessages, useIntl } from 'react-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import { UniversalLink } from '@plone/volto/components';
import downSVG from '@plone/volto/icons/down.svg';
import circleDismissSVG from '@plone/volto/icons/circle-dismiss.svg';

import type { ComissaoPeriodo } from '@simplesconsultoria/volto-eprocessos/types';
import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

const messages = defineMessages({
  tableLabel: {
    id: 'Comissao view periods heading',
    defaultMessage: 'Periods',
  },
  idPeriodo: {
    id: 'Comissao period id',
    defaultMessage: 'Id',
  },
  start: {
    id: 'Comissao period start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'Comissao period end',
    defaultMessage: 'End',
  },
  composition: {
    id: 'Comissao period composition',
    defaultMessage: 'Composition',
  },
  compositionToggle: {
    id: 'Comissao period composition toggle',
    defaultMessage: 'Toggle composition menu ({count})',
  },
  compositionClose: {
    id: 'Comissao period composition close',
    defaultMessage: 'Close composition menu',
  },
  councilorsTitle: {
    id: 'Comissao period composition title',
    defaultMessage: 'Vereadores',
  },
  emptyPeriods: {
    id: 'Comissao empty periods',
    defaultMessage: 'No period recorded.',
  },
});

interface PeriodosProps {
  periods: Array<ComissaoPeriodo & Record<string, any>>;
}

type PeriodoParticipante = Record<string, any>;

const getPartyLabel = (item: PeriodoParticipante): string => {
  const partido = item?.partido;
  if (!Array.isArray(partido)) return '';
  return partido
    .map((p) => p?.token)
    .filter(Boolean)
    .join(', ');
};

const getParticipanteLabel = (item: PeriodoParticipante): string => {
  return (item?.title || item?.description || '').toString();
};

const getParticipanteCargo = (item: PeriodoParticipante): string => {
  return (item?.cargo || item?.mandato || '').toString();
};

const sortComposicao = (
  items: PeriodoParticipante[],
): PeriodoParticipante[] => {
  return [...items].sort((a, b) => {
    const oa = Number.isFinite(a?.ordem) ? a.ordem : 999;
    const ob = Number.isFinite(b?.ordem) ? b.ordem : 999;
    if (oa !== ob) return oa - ob;
    return getParticipanteLabel(a).localeCompare(getParticipanteLabel(b));
  });
};

const Composicao = ({
  items,
  periodKey,
}: {
  items?: PeriodoParticipante[];
  periodKey: string;
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const sorted = useMemo(() => sortComposicao(list), [list]);
  const safeKey = periodKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  const panelId = `comissao-composicao-${safeKey}`;
  const toggleLabel = intl.formatMessage(messages.compositionToggle, {
    count: sorted.length,
  });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const wrap = wrapRef.current;
      if (!wrap || !target) return;
      if (!wrap.contains(target)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const wrap = wrapRef.current;
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    if (!menu || !toggle) return;

    const margin = 8;

    const applyConstraints = () => {
      const table = wrap?.closest(
        'table.comissao-periodos',
      ) as HTMLElement | null;
      const tableRect = table?.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();

      const belowViewport = window.innerHeight - toggleRect.bottom - margin;
      const aboveViewport = toggleRect.top - margin;

      const belowTable = tableRect
        ? tableRect.bottom - toggleRect.bottom - margin
        : belowViewport;
      const aboveTable = tableRect
        ? toggleRect.top - tableRect.top - margin
        : aboveViewport;

      const spaceBelow = Math.min(belowViewport, belowTable);
      const spaceAbove = Math.min(aboveViewport, aboveTable);

      const minMenu = 160;
      const placement =
        spaceBelow < minMenu && spaceAbove > spaceBelow ? 'top' : 'bottom';

      const maxHeightRaw = placement === 'top' ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(140, Math.floor(maxHeightRaw));

      menu.dataset.placement = placement;
      menu.style.setProperty('--comissao-composicao-max-h', `${maxHeight}px`);

      // Horizontal shift to keep menu within viewport.
      const rect = menu.getBoundingClientRect();
      const vw = window.innerWidth;
      let deltaX = 0;
      if (rect.left < margin) deltaX = margin - rect.left;
      else if (rect.right > vw - margin) deltaX = vw - margin - rect.right;
      menu.style.setProperty(
        '--comissao-composicao-shift-x',
        `${Number.isFinite(deltaX) ? deltaX : 0}px`,
      );
    };

    const raf = window.requestAnimationFrame(applyConstraints);
    window.addEventListener('resize', applyConstraints);
    // capture=true to also react to scrollable parents
    window.addEventListener('scroll', applyConstraints, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', applyConstraints);
      window.removeEventListener('scroll', applyConstraints, true);
    };
  }, [open, sorted.length]);

  if (!sorted.length) return <span>-</span>;

  return (
    <div className="comissao-composicao" ref={wrapRef}>
      <button
        type="button"
        className="comissao-composicao-toggle"
        ref={toggleRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={downSVG} size="1.25rem" ariaHidden={true} />
      </button>
      {open ? (
        <div id={panelId} ref={menuRef} className="comissao-composicao-menu">
          <div className="comissao-composicao-menu-header">
            <div className="comissao-composicao-title">
              {intl.formatMessage(messages.councilorsTitle)}
            </div>
            <button
              type="button"
              className="comissao-composicao-close"
              aria-label={intl.formatMessage(messages.compositionClose)}
              title={intl.formatMessage(messages.compositionClose)}
              onClick={() => setOpen(false)}
            >
              <Icon name={circleDismissSVG} size="1.25rem" ariaHidden={true} />
            </button>
          </div>
          <div className="comissao-composicao-menu-body">
            {sorted.map((item, idx) => {
              const id = item?.id;
              const href = id ? `/vereadores/${id}` : undefined;
              const name = getParticipanteLabel(item) || '-';
              const party = getPartyLabel(item);
              const cargo = getParticipanteCargo(item);
              const line1 = party ? `${name} - ${party}` : name;

              const content = (
                <div className="comissao-composicao-row">
                  <div className="comissao-composicao-line1">{line1}</div>
                  {cargo ? (
                    <div className="comissao-composicao-cargo">{cargo}</div>
                  ) : null}
                </div>
              );

              return href ? (
                <UniversalLink
                  key={`${id}-${idx}`}
                  href={href}
                  className="comissao-composicao-link"
                  onClick={() => setOpen(false)}
                >
                  {content}
                </UniversalLink>
              ) : (
                <div
                  key={`${name}-${idx}`}
                  className="comissao-composicao-item"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Periodos = ({ periods }: PeriodosProps) => {
  const intl = useIntl();

  if (!periods?.length) {
    return <p>{intl.formatMessage(messages.emptyPeriods)}</p>;
  }

  const sorted = [...periods].sort((a, b) => {
    const sa = (a.start || '').toString();
    const sb = (b.start || '').toString();
    if (sa !== sb) return sb.localeCompare(sa);
    const ea = (a.end || '').toString();
    const eb = (b.end || '').toString();
    return eb.localeCompare(ea);
  });

  return (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full comissao-periodos'}
    >
      <TableHeader>
        <Row>
          <Column isRowHeader className={'id'}>
            {intl.formatMessage(messages.idPeriodo)}
          </Column>
          <Column className={'start'}>
            {intl.formatMessage(messages.start)}
          </Column>
          <Column className={'end'}>{intl.formatMessage(messages.end)}</Column>
          <Column className={'composition'}>
            {intl.formatMessage(messages.composition)}
          </Column>
        </Row>
      </TableHeader>
      <TableBody>
        {sorted.map((p, idx) => (
          <Row key={(p as any).id ?? idx} className="comissao-periodo">
            <Column className="id">{(p as any).id ?? '-'}</Column>
            <Column>
              <DataCurta date={p.start} defaultValue="-" />
            </Column>
            <Column>
              <DataCurta date={p.end} defaultValue="-" />
            </Column>
            <Column className="composicao">
              <Composicao
                items={(p as any).items}
                periodKey={String((p as any).id ?? idx)}
              />
            </Column>
          </Row>
        ))}
      </TableBody>
    </Table>
  );
};

export default Periodos;
