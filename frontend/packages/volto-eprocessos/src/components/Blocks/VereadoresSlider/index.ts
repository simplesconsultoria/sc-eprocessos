import sliderSVG from '@plone/volto/icons/slider.svg';
import type { BlockConfigBase } from '@plone/types';

import Edit from './Edit';
import View from './View';
import { VereadoresSliderBlockSchema } from './schema';

export interface VereadoresSliderItemImage {
  download?: string;
  filename?: string;
  'content-type'?: string;
  width?: string | number;
  height?: string | number;
  scales?: Record<
    string,
    {
      download: string;
      width: number;
      height: number;
    }
  >;
}

export interface VereadoresSliderItem {
  '@id'?: string;
  id?: string;
  title?: string;
  fullname?: string;
  description?: string;
  image?: VereadoresSliderItemImage[];
  image_field?: string;
  image_scales?: Record<string, VereadoresSliderItemImage[]>;
  url_foto?: string;
}

export interface VereadoresSliderBlockData {
  source?: Array<{ '@id'?: string; title?: string }>;
  allLink?: Array<{ '@id'?: string; title?: string }>;
  allLinkLabel?: string;
  autoplay?: boolean;
  autoplayIntervalSeconds?: number;
  styles?: any;
}

const VereadoresSliderBlockInfo: BlockConfigBase = {
  id: 'vereadoresSlider',
  // Volto's BlockChooser treats this as an i18n message id.
  title: 'Vereadores slider',
  icon: sliderSVG,
  group: 'common',
  view: View,
  edit: Edit,
  blockSchema: VereadoresSliderBlockSchema,
  restricted: false,
  mostUsed: false,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
};

export default VereadoresSliderBlockInfo;
