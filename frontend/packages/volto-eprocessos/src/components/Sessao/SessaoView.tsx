import { Container, Tabs } from '@plone/components';
import { Tab, TabList, TabPanel } from 'react-aria-components';
import { defineMessages, useIntl } from 'react-intl';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getContent } from '@plone/volto/actions/content/content';

import type { Sessao } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { FileAttachmentList } from '@simplesconsultoria/volto-eprocessos/components/FileAttachment/FileAttachment';
import { resolveEprocessosAppPath } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';

import Presenca from './Presenca';
import Votacao from './Votacao';

interface SessaoViewProps {
  content?: Sessao | null;
}

const messages = defineMessages({
  error: {
    id: 'Sessao view error',
    defaultMessage: 'Could not load session.',
  },
  date: {
    id: 'Sessao view date label',
    defaultMessage: 'Date',
  },
  time: {
    id: 'Sessao view time label',
    defaultMessage: 'Time',
  },
  pauta: {
    id: 'Sessao view pauta heading',
    defaultMessage: 'Agenda',
  },
  ata: {
    id: 'Sessao view ata heading',
    defaultMessage: 'Minutes',
  },
  presenca: {
    id: 'Sessao view presenca heading',
    defaultMessage: 'Attendance',
  },
  votacao: {
    id: 'Sessao view votacao heading',
    defaultMessage: 'Voting',
  },
  noFiles: {
    id: 'Sessao view no files',
    defaultMessage: 'No files.',
  },
});

const hasUsefulData = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj.items) && obj.items.length) return true;
  if (Array.isArray(obj.chamadaRegimental) && obj.chamadaRegimental.length)
    return true;
  if (Array.isArray(obj.ordemDia) && obj.ordemDia.length) return true;
  return false;
};

const SessaoView = ({ content }: SessaoViewProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const id = (content as any)?.id;

  const presencaKey = useMemo(
    () => (id ? `sessao-presenca-${id}` : null),
    [id],
  );
  const votacaoKey = useMemo(() => (id ? `sessao-votacao-${id}` : null), [id]);

  const presencaRequest = useSelector((state: any) =>
    presencaKey ? state.content?.subrequests?.[presencaKey] : null,
  );
  const votacaoRequest = useSelector((state: any) =>
    votacaoKey ? state.content?.subrequests?.[votacaoKey] : null,
  );

  const contentId = (content as any)?.['@id'];

  const presencaUrl = resolveEprocessosAppPath(
    (content as any)?.presenca?.['@id'] ||
      (content as any)?.['@id_presenca'] ||
      (contentId ? `${contentId}/presenca` : undefined),
    { allowExternal: false },
  );
  const votacaoUrl = resolveEprocessosAppPath(
    (content as any)?.votacao?.['@id'] ||
      (content as any)?.['@id_votacao'] ||
      (contentId ? `${contentId}/votacao` : undefined),
    { allowExternal: false },
  );

  const presencaFromContent = (content as any)?.presenca;
  const votacaoFromContent = (content as any)?.votacao;

  useEffect(() => {
    if (!content) return;
    if (!presencaKey || !presencaUrl) return;
    if (hasUsefulData(presencaFromContent)) return;
    if (presencaRequest?.loading || presencaRequest?.loaded) return;
    dispatch(getContent(presencaUrl, null, presencaKey) as any);
  }, [
    content,
    dispatch,
    presencaKey,
    presencaUrl,
    presencaFromContent,
    presencaRequest,
  ]);

  useEffect(() => {
    if (!content) return;
    if (!votacaoKey || !votacaoUrl) return;
    if (hasUsefulData(votacaoFromContent)) return;
    if (votacaoRequest?.loading || votacaoRequest?.loaded) return;
    dispatch(getContent(votacaoUrl, null, votacaoKey) as any);
  }, [
    content,
    dispatch,
    votacaoKey,
    votacaoUrl,
    votacaoFromContent,
    votacaoRequest,
  ]);

  if (!content) {
    return (
      <Container id="page-document" className="view-wrapper sessao-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const presencaData = hasUsefulData(presencaFromContent)
    ? presencaFromContent
    : presencaRequest?.data;

  const votacaoData = hasUsefulData(votacaoFromContent)
    ? votacaoFromContent
    : votacaoRequest?.data;

  const panels = [
    {
      id: 'pauta',
      title: intl.formatMessage(messages.pauta),
      content: (
        <FileAttachmentList
          items={(content as any).pauta}
          empty={<p>{intl.formatMessage(messages.noFiles)}</p>}
        />
      ),
    },
    {
      id: 'ata',
      title: intl.formatMessage(messages.ata),
      content: (
        <FileAttachmentList
          items={(content as any).ata}
          empty={<p>{intl.formatMessage(messages.noFiles)}</p>}
        />
      ),
    },
    {
      id: 'presenca',
      title: intl.formatMessage(messages.presenca),
      content: <Presenca data={presencaData} />,
    },
    {
      id: 'votacao',
      title: intl.formatMessage(messages.votacao),
      content: <Votacao data={votacaoData} />,
    },
  ];

  const typeLabel = (content as any).type;

  return (
    <Container
      id="page-document"
      className="view-wrapper sessao-view"
      width="default"
    >
      <header className="sessao-header">
        <h1 className="documentFirstHeading">{content.title}</h1>
        {content.description ? (
          <p className="documentDescription">{content.description}</p>
        ) : null}

        <div className="sessao-meta">
          {typeLabel ? (
            <span className="badge badge-type">{typeLabel}</span>
          ) : null}

          <dl>
            {(content as any).date ? (
              <>
                <dt>{intl.formatMessage(messages.date)}</dt>
                <dd>
                  <DataCurta date={(content as any).date} defaultValue="-" />
                </dd>
              </>
            ) : null}
            {(content as any).startTime || (content as any).endTime ? (
              <>
                <dt>{intl.formatMessage(messages.time)}</dt>
                <dd>
                  {(content as any).startTime || '-'}
                  {(content as any).endTime
                    ? ` – ${(content as any).endTime}`
                    : ''}
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </header>

      <section className="sessao-panels">
        <Tabs>
          <TabList aria-label={content.title || 'Sessão'}>
            {panels.map((p) => (
              <Tab key={p.id} id={p.id}>
                {p.title}
              </Tab>
            ))}
          </TabList>
          {panels.map((p) => (
            <TabPanel key={p.id} id={p.id}>
              {p.content}
            </TabPanel>
          ))}
        </Tabs>
      </section>
    </Container>
  );
};

export default SessaoView;
