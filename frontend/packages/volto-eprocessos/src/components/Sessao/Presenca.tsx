import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  empty: {
    id: 'Sessao view presenca empty',
    defaultMessage: 'No attendance data.',
  },
  regimental: {
    id: 'Sessao view presenca regimental',
    defaultMessage: 'Regimental call',
  },
  ordemDia: {
    id: 'Sessao view presenca ordem dia',
    defaultMessage: 'Order of the day',
  },
  present: {
    id: 'Sessao view presenca present',
    defaultMessage: 'Present',
  },
  absent: {
    id: 'Sessao view presenca absent',
    defaultMessage: 'Absent',
  },
  justified: {
    id: 'Sessao view presenca justified',
    defaultMessage: 'Justified',
  },
});

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

const names = (v: any): string[] =>
  asArray(v)
    .map((it) => {
      if (typeof it === 'string') return it;
      if (it?.title) return String(it.title);
      return '';
    })
    .filter(Boolean);

const PresenceBlock = ({ title, data }: { title: string; data?: any }) => {
  const intl = useIntl();

  const presentes = names(data?.presentes);
  const ausentes = names(data?.ausentes);
  const justificados = names(data?.justificados);

  const presentesQtde = data?.presentes_qtde ?? presentes.length;
  const ausentesQtde = data?.ausentes_qtde ?? ausentes.length;
  const justificadosQtde = data?.justificados_qtde ?? justificados.length;

  return (
    <div className="sessao-presenca-block">
      <h3 className="sessao-presenca-block__title">{title}</h3>
      <dl className="sessao-presenca-block__counts">
        <dt>{intl.formatMessage(messages.present)}</dt>
        <dd>{presentesQtde ?? '-'}</dd>
        <dt>{intl.formatMessage(messages.absent)}</dt>
        <dd>{ausentesQtde ?? '-'}</dd>
        <dt>{intl.formatMessage(messages.justified)}</dt>
        <dd>{justificadosQtde ?? '-'}</dd>
      </dl>

      {presentes.length || ausentes.length || justificados.length ? (
        <div className="sessao-presenca-block__lists">
          {presentes.length ? (
            <div>
              <strong>{intl.formatMessage(messages.present)}</strong>
              <ul>
                {presentes.map((n) => (
                  <li key={`p-${n}`}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {ausentes.length ? (
            <div>
              <strong>{intl.formatMessage(messages.absent)}</strong>
              <ul>
                {ausentes.map((n) => (
                  <li key={`a-${n}`}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {justificados.length ? (
            <div>
              <strong>{intl.formatMessage(messages.justified)}</strong>
              <ul>
                {justificados.map((n) => (
                  <li key={`j-${n}`}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const Presenca = ({ data }: { data?: any }) => {
  const intl = useIntl();

  if (!data) {
    return <p>{intl.formatMessage(messages.empty)}</p>;
  }

  // Newer payloads (as observed in Plone traversal) expose chamadaRegimental / ordemDia
  const chamadaRegimental = asArray((data as any).chamadaRegimental);
  const ordemDia = asArray((data as any).ordemDia);

  // Older payloads may expose a flat `items` array
  const items = asArray((data as any).items);

  if (!chamadaRegimental.length && !ordemDia.length && !items.length) {
    return <p>{intl.formatMessage(messages.empty)}</p>;
  }

  return (
    <div className="sessao-presenca">
      {chamadaRegimental.length ? (
        <PresenceBlock
          title={intl.formatMessage(messages.regimental)}
          data={chamadaRegimental[0]}
        />
      ) : null}
      {ordemDia.length ? (
        <PresenceBlock
          title={intl.formatMessage(messages.ordemDia)}
          data={ordemDia[0]}
        />
      ) : null}

      {items.length ? (
        <div className="sessao-presenca-items">
          <ul>
            {items.map((it: any, idx: number) => (
              <li key={`${it?.id || it?.title || 'presenca'}-${idx}`}>
                {it?.title || it?.name || '-'}
                {typeof it?.presente === 'boolean' ? (
                  <span>
                    {' — '}
                    {it.presente
                      ? intl.formatMessage(messages.present)
                      : intl.formatMessage(messages.absent)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Presenca;
