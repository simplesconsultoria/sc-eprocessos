import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';

import type { Comissao } from '@simplesconsultoria/volto-eprocessos/types';

interface SumarioProps {
  content: Comissao;
}

const messages = defineMessages({
  type: {
    id: 'Comissao view type label',
    defaultMessage: 'Type',
  },
  acronym: {
    id: 'Comissao view acronym label',
    defaultMessage: 'Acronym',
  },
});

const Sumario = ({ content }: SumarioProps) => {
  const intl = useIntl();

  return (
    <Container width={'default'} className="sumario">
      <h1 className="documentFirstHeading">{content.title}</h1>

      <div id="card">
        <Container className="dados">
          <p className="comissao-meta">
            {content.tipo ? (
              <>
                <strong>{intl.formatMessage(messages.type)}:</strong>{' '}
                {content.tipo}
                <br />
              </>
            ) : null}
            {content.description ? (
              <>
                <strong>{intl.formatMessage(messages.acronym)}:</strong>{' '}
                {content.description}
              </>
            ) : null}
          </p>
        </Container>
      </div>
    </Container>
  );
};

export default Sumario;
