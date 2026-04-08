import { defineMessages } from 'react-intl';
import type { BlockSchemaProps } from '@plone/types';

const messages = defineMessages({
  blockTitle: {
    id: 'Vereadores slider block',
    defaultMessage: 'Councilors (slider)',
  },
  source: {
    id: 'Vereadores slider source',
    defaultMessage: 'Source (Councilors)',
  },
  sourceHelp: {
    id: 'Vereadores slider source help',
    defaultMessage: 'Select the “Councilors” content from the site.',
  },
  allLink: {
    id: 'Vereadores slider all link',
    defaultMessage: '“See all” link',
  },
  allLinkLabel: {
    id: 'Vereadores slider all link label',
    defaultMessage: 'Link text',
  },
  allLinkLabelDefault: {
    id: 'Vereadores slider all link label default',
    defaultMessage: 'See all councilors',
  },
  autoplay: {
    id: 'Vereadores slider autoplay',
    defaultMessage: 'Autoplay',
  },
  autoplayHelp: {
    id: 'Vereadores slider autoplay help',
    defaultMessage: 'Automatically rotates councilors in the slider.',
  },
  autoplayInterval: {
    id: 'Vereadores slider autoplay interval',
    defaultMessage: 'Interval (seconds)',
  },
  autoplayIntervalHelp: {
    id: 'Vereadores slider autoplay interval help',
    defaultMessage: 'Seconds between rotations (minimum 1).',
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
        default: intl.formatMessage(messages.allLinkLabelDefault),
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
