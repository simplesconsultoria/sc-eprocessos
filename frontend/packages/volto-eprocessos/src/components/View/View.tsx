/**
 * View container — shadow of Volto core's `components/theme/View/View.jsx`.
 *
 * Difference vs upstream: when the route has a querystring (e.g.
 * `/sessoes?ano=2026&tipo=1`), it is forwarded to ``getContent`` so the
 * backend serializer can return filtered results, and a change in
 * ``location.search`` re-fetches the content — upstream only reacts to
 * pathname changes.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Redirect } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { injectIntl } from 'react-intl';
import qs from 'query-string';

import ContentMetadataTags from '@plone/volto/components/theme/ContentMetadataTags/ContentMetadataTags';
import Comments from '@plone/volto/components/theme/Comments/Comments';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import { listActions } from '@plone/volto/actions/actions/actions';
import { getContent } from '@plone/volto/actions/content/content';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { getLayoutFieldname } from '@plone/volto/helpers/Content/Content';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import { AlternateHrefLangs } from '@plone/volto/components/theme/AlternateHrefLangs/AlternateHrefLangs';

import config from '@plone/volto/registry';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';

/**
 * Build the URL passed to ``getContent``: ``getBaseUrl(pathname)`` plus the
 * raw querystring, unless a version is being viewed (the version segment is
 * appended by the action, so a querystring here would collide with it).
 */
const buildContentUrl = (
  pathname: string,
  search: string | undefined,
  versionId: string | null | undefined,
): string => {
  const base = getBaseUrl(pathname);
  if (versionId) {
    return base;
  }
  return search ? `${base}${search}` : base;
};

class View extends Component<
  any,
  { hasObjectButtons: boolean | null; isClient: boolean }
> {
  static propTypes = {
    actions: PropTypes.shape({
      object: PropTypes.arrayOf(PropTypes.object),
      object_buttons: PropTypes.arrayOf(PropTypes.object),
      user: PropTypes.arrayOf(PropTypes.object),
    }),
    listActions: PropTypes.func.isRequired,
    getContent: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }).isRequired,
    versionId: PropTypes.string,
    content: PropTypes.shape({
      layout: PropTypes.string,
      allow_discussion: PropTypes.bool,
      title: PropTypes.string,
      description: PropTypes.string,
      '@type': PropTypes.string,
      subjects: PropTypes.arrayOf(PropTypes.string),
      is_folderish: PropTypes.bool,
    }),
    error: PropTypes.shape({
      status: PropTypes.number,
    }),
  };

  static defaultProps = {
    actions: null,
    content: null,
    versionId: null,
    error: null,
  };

  state = {
    hasObjectButtons: null,
    isClient: false,
  };

  componentDidMount() {
    if (!hasApiExpander('actions', getBaseUrl(this.props.pathname))) {
      this.props.listActions(getBaseUrl(this.props.pathname));
    }

    this.props.getContent(
      buildContentUrl(
        this.props.pathname,
        this.props.location?.search,
        this.props.versionId,
      ),
      this.props.versionId,
    );
    this.setState({ isClient: true });
  }

  UNSAFE_componentWillReceiveProps(nextProps: any) {
    const pathnameChanged = nextProps.pathname !== this.props.pathname;
    const searchChanged =
      nextProps.location?.search !== this.props.location?.search;

    if (pathnameChanged || searchChanged) {
      if (
        pathnameChanged &&
        !hasApiExpander('actions', getBaseUrl(nextProps.pathname))
      ) {
        this.props.listActions(getBaseUrl(nextProps.pathname));
      }

      this.props.getContent(
        buildContentUrl(
          nextProps.pathname,
          nextProps.location?.search,
          nextProps.versionId,
        ),
        nextProps.versionId,
      );
    }

    if (nextProps.actions?.object_buttons) {
      const objectButtons = nextProps.actions.object_buttons;
      this.setState({
        hasObjectButtons: !!objectButtons.length,
      });
    }
  }

  getViewDefault = () => config.views.defaultView;

  getViewByType = () =>
    config.views.contentTypesViews[this.props.content['@type']] || null;

  getViewByLayout = () =>
    config.views.layoutViews[
      getLayoutFieldname(
        this.props.content,
      ) as keyof typeof config.views.layoutViews
    ] || null;

  cleanViewName = (dirtyDisplayName: string) =>
    dirtyDisplayName
      .replace('Connect(', '')
      .replace('injectIntl(', '')
      .replace(')', '')
      .replace('connect(', '')
      .toLowerCase();

  render() {
    const { views } = config;
    if ([301, 302].includes(this.props.error?.code)) {
      const redirect = flattenToAppURL(this.props.error.url)
        .split('?')[0]
        .replace('/++api++', '');
      return <Redirect to={`${redirect}${this.props.location.search}`} />;
    } else if (this.props.error && !this.props.connectionRefused) {
      let FoundView;
      if (this.props.error.status === undefined) {
        FoundView = views.errorViews.corsError;
      } else {
        FoundView = views.errorViews[this.props.error.status.toString()];
      }
      if (!FoundView) {
        FoundView = views.errorViews['404'];
      }
      return (
        <div id="view">
          <BodyClass
            className={
              FoundView.displayName
                ? `view-${this.cleanViewName(FoundView.displayName)}`
                : null
            }
          />
          <FoundView {...this.props} />
        </div>
      );
    }
    if (!this.props.content) {
      return <span />;
    }
    const RenderedView =
      this.getViewByLayout() || this.getViewByType() || this.getViewDefault();

    return (
      <div id="view" tabIndex={-1}>
        <ContentMetadataTags content={this.props.content} />
        <AlternateHrefLangs content={this.props.content} />
        <BodyClass
          className={
            RenderedView.displayName
              ? `view-${this.cleanViewName(RenderedView.displayName)}`
              : null
          }
        />
        <SlotRenderer
          name="aboveContent"
          content={this.props.content}
          location={this.props.location}
        />
        <RenderedView
          key={flattenToAppURL(this.props.content['@id'])}
          content={this.props.content}
          location={this.props.location}
          token={this.props.token}
          history={this.props.history}
        />
        <SlotRenderer
          name="belowContent"
          content={this.props.content}
          location={this.props.location}
        />
        {this.props.content.allow_discussion && (
          <Comments pathname={this.props.pathname} />
        )}
        {this.state.isClient &&
          createPortal(
            <Toolbar pathname={this.props.pathname} inner={<span />} />,
            document.getElementById('toolbar') as Element,
          )}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  connect(
    (state: any, props: any) => ({
      actions: state.actions.actions,
      token: state.userSession.token,
      content: state.content.data,
      error: state.content.get.error,
      apiError: state.apierror.error,
      connectionRefused: state.apierror.connectionRefused,
      pathname: props.location.pathname,
      versionId:
        qs.parse(props.location.search) &&
        qs.parse(props.location.search).version,
    }),
    {
      listActions,
      getContent,
    },
  ),
)(View);
