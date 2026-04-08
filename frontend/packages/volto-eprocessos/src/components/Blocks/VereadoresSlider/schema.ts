import { defineMessages } from 'react-intl';
import type { BlockSchemaProps } from '@plone/types';

const messages = defineMessages({
  blockTitle: {
    id: 'Vereadores slider block',
    defaultMessage: 'Vereadores (slider)',
  },
  source: {
    id: 'Vereadores slider source',
    defaultMessage: 'Fonte (Vereadores)',
  },
  sourceHelp: {
    id: 'Vereadores slider source help',
    defaultMessage: 'Selecione o conteúdo “Vereadores” do site.',
  },
  allLink: {
    id: 'Vereadores slider all link',
    defaultMessage: 'Link “ver todos”',
  },
  allLinkLabel: {
    id: 'Vereadores slider all link label',
    defaultMessage: 'Texto do link',
  },
  autoplay: {
    id: 'Vereadores slider autoplay',
    defaultMessage: 'Trocar automaticamente',
  },
  autoplayHelp: {
    id: 'Vereadores slider autoplay help',
    defaultMessage: 'Ativa a troca automática de vereador no slider.',
  },
  autoplayInterval: {
    id: 'Vereadores slider autoplay interval',
    defaultMessage: 'Intervalo (segundos)',
  },
  autoplayIntervalHelp: {
    id: 'Vereadores slider autoplay interval help',
    defaultMessage: 'Tempo em segundos entre as trocas (mínimo 1).',
  },
});

export const VereadoresSliderBlockSchema = (props: BlockSchemaProps): any => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.blockTitle),
    fieldsets: [
      {
        id: 'default',
        title: 'default',
        fields: [
          'source',
          'allLink',
          'allLinkLabel',
          'autoplay',
          'autoplayIntervalSeconds',
        ],
      },
    ],
    properties: {
      source: {
        title: intl.formatMessage(messages.source),
        description: intl.formatMessage(messages.sourceHelp),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: false,
        selectedItemAttrs: ['Title', '@type'],
      },
      allLink: {
        title: intl.formatMessage(messages.allLink),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: true,
        selectedItemAttrs: ['Title', '@type'],
      },
      allLinkLabel: {
        title: intl.formatMessage(messages.allLinkLabel),
        type: 'string',
        default: 'Ver todos os vereadores',
      },
      autoplay: {
        title: intl.formatMessage(messages.autoplay),
        description: intl.formatMessage(messages.autoplayHelp),
        type: 'boolean',
        default: false,
      },
      autoplayIntervalSeconds: {
        title: intl.formatMessage(messages.autoplayInterval),
        description: intl.formatMessage(messages.autoplayIntervalHelp),
        type: 'number',
        default: 5,
        minimum: 1,
      },
    },
    required: [],
  };
};
