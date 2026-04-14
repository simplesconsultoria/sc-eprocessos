import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  empty: {
    id: 'Sessao view votacao empty',
    defaultMessage: 'No voting data.',
  },
  favorable: {
    id: 'Sessao view votacao favorable',
    defaultMessage: 'Favorable',
  },
  against: {
    id: 'Sessao view votacao against',
    defaultMessage: 'Against',
  },
  abstention: {
    id: 'Sessao view votacao abstention',
    defaultMessage: 'Abstention',
  },
  absent: {
    id: 'Sessao view votacao absent',
    defaultMessage: 'Absent',
  },
  presidency: {
    id: 'Sessao view votacao presidency',
    defaultMessage: 'Presidency',
  },
  result: {
    id: 'Sessao view votacao result label',
    defaultMessage: 'Result',
  },
  quorum: {
    id: 'Sessao view votacao quorum label',
    defaultMessage: 'Quorum',
  },
  votingType: {
    id: 'Sessao view votacao type label',
    defaultMessage: 'Voting type',
  },
  round: {
    id: 'Sessao view votacao round label',
    defaultMessage: 'Round',
  },
});

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

const Votacao = ({ data }: { data?: any }) => {
  const intl = useIntl();

  if (!data) {
    return <p>{intl.formatMessage(messages.empty)}</p>;
  }

  const items = asArray((data as any).items);
  if (!items.length) {
    return <p>{intl.formatMessage(messages.empty)}</p>;
  }

  return (
    <div className="sessao-votacao">
      {items.map((it: any, idx: number) => {
        const apuracao = asArray(it?.apuracao);
        const resultado = apuracao?.[0]?.resultado || it?.resultado;
        const votosBlocks = asArray(it?.votos);
        const votos = votosBlocks?.[0] || {};

        const groups = [
          {
            key: 'favoravel',
            label: intl.formatMessage(messages.favorable),
          },
          {
            key: 'contrario',
            label: intl.formatMessage(messages.against),
          },
          {
            key: 'abstencao',
            label: intl.formatMessage(messages.abstention),
          },
          {
            key: 'ausente',
            label: intl.formatMessage(messages.absent),
          },
          {
            key: 'presidencia',
            label: intl.formatMessage(messages.presidency),
          },
        ];

        return (
          <div className="sessao-votacao-item" key={`${resultado}-${idx}`}>
            <div className="sessao-votacao-item__header">
              <strong>{resultado || '-'}</strong>
            </div>
            <dl className="sessao-votacao-item__meta">
              {it?.quorum ? (
                <>
                  <dt>{intl.formatMessage(messages.quorum)}</dt>
                  <dd>{it.quorum}</dd>
                </>
              ) : null}
              {it?.tipo_votacao ? (
                <>
                  <dt>{intl.formatMessage(messages.votingType)}</dt>
                  <dd>{it.tipo_votacao}</dd>
                </>
              ) : null}
              {it?.turno ? (
                <>
                  <dt>{intl.formatMessage(messages.round)}</dt>
                  <dd>{it.turno}</dd>
                </>
              ) : null}
            </dl>

            {groups.some(
              (g) =>
                Array.isArray((votos as any)[g.key]) &&
                (votos as any)[g.key].length,
            ) ? (
              <div className="sessao-votacao-item__votes">
                {groups.map((g) => {
                  const list = asArray((votos as any)[g.key]);
                  if (!list.length) return null;
                  return (
                    <div
                      key={g.key}
                      className="sessao-votacao-item__vote-group"
                    >
                      <strong>{g.label}</strong>
                      <ul>
                        {list.map((v: any, i: number) => (
                          <li key={`${g.key}-${v?.title || v}-${i}`}>
                            {v?.title || v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default Votacao;
