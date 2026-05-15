import { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'query-string';
import { Disclosure } from '@plone/components';
import { Button, DisclosurePanel } from 'react-aria-components';
import { Form } from '@plone/volto/components/manage/Form';

import type { FormConfig } from '@simplesconsultoria/volto-eprocessos/types';

interface FilterFormProps<TItem> {
  schema: FormConfig;
  items?: TItem[];
  ResultsComponent: React.ComponentType<{ items: TItem[] }>;
}

interface AppliedFilter {
  key: string;
  fieldLabel: string;
  valueLabel: string;
}

const messages = defineMessages({
  formDescription: {
    id: 'FilterForm.formDescription',
    defaultMessage: 'Use the filters below to refine the results.',
  },
  submitLabel: {
    id: 'FilterForm.submitLabel',
    defaultMessage: 'Filter',
  },
  cancelLabel: {
    id: 'FilterForm.cancelLabel',
    defaultMessage: 'Clear',
  },
  appliedFilters: {
    id: 'FilterForm.appliedFilters',
    defaultMessage: 'Filtering by:',
  },
});

const resolveValueLabel = (
  property: Record<string, unknown>,
  rawValue: string,
): string => {
  const choices = property.choices;
  if (Array.isArray(choices)) {
    const match = (choices as Array<[string, string]>).find(
      ([id]) => id === rawValue,
    );
    if (match) return match[1];
  }
  return rawValue;
};

function FilterForm<TItem>({
  schema,
  items,
  ResultsComponent,
}: FilterFormProps<TItem>) {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const hasItems = !!items?.length;
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  // Volto's `<Form>` reads ``formData`` only in its constructor; bumping
  // this key on Cancel forces a remount so the cleared ``formData`` prop
  // actually takes effect. Submit doesn't bump it, so the just-submitted
  // values stay visible when the user re-opens the panel via "Alterar".
  const [resetKey, setResetKey] = useState(0);

  // The filter pane is collapsed once results are visible and expanded
  // otherwise (initial render with no params, or a search that returned
  // nothing). Manual toggles between transitions are preserved — the
  // effect only re-syncs when ``hasItems`` itself flips.
  const [isExpanded, setIsExpanded] = useState<boolean>(!hasItems);
  useEffect(() => {
    setIsExpanded(!hasItems);
  }, [hasItems]);

  useEffect(() => {
    setFormData(qs.parse(location.search) as Record<string, unknown>);
  }, [location.search]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const isValidLabelTarget = (el: Element | null): el is HTMLElement => {
      if (!el) return false;

      if (
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      ) {
        return true;
      }

      if (el instanceof HTMLInputElement) {
        return !['hidden', 'submit', 'reset', 'button', 'image'].includes(
          el.type,
        );
      }

      return false;
    };

    const applyA11yFixes = () => {
      // Ensure invisible fieldsets still expose an accessible name.
      root.querySelectorAll('fieldset.invisible').forEach((fieldset) => {
        if (fieldset.querySelector('legend')) return;
        const legend = document.createElement('legend');
        legend.className = 'sr-only';
        legend.textContent =
          schema.title || intl.formatMessage(messages.formDescription);
        fieldset.prepend(legend);
      });

      // If label[for] points to a missing control, bind it to the first
      // control found in the same field wrapper.
      root.querySelectorAll('label[for]').forEach((label) => {
        const targetId = label.getAttribute('for');
        if (!targetId) return;

        const existingTarget = root.ownerDocument.getElementById(targetId);
        if (isValidLabelTarget(existingTarget)) return;

        const field = label.closest('.field');
        const controls = field?.querySelectorAll('input, select, textarea');
        const control =
          Array.from(controls ?? []).find((candidate) =>
            isValidLabelTarget(candidate),
          ) ?? null;

        if (control) {
          control.setAttribute('id', targetId);
          return;
        }

        // Custom controls (like react-select) are often div-based and cannot
        // be linked with label[for]. Preserve an accessible name and remove
        // the invalid/orphan label node.
        const customControl =
          field?.querySelector('[role="combobox"]') ??
          field?.querySelector('.react-select__control');
        if (customControl && label.textContent?.trim()) {
          customControl.setAttribute('aria-label', label.textContent.trim());
        }

        label.remove();
      });

      // Avoid duplicated accessible names announced from aria-label + title.
      root
        .querySelectorAll<HTMLButtonElement>('button[aria-label][title]')
        .forEach((button) => {
          if (
            button.getAttribute('aria-label') === button.getAttribute('title')
          ) {
            button.removeAttribute('title');
          }
        });
    };

    applyA11yFixes();

    const observer = new MutationObserver(() => {
      applyA11yFixes();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [intl, schema.title, resetKey]);

  // Filters currently applied via the querystring — built from ``formData``
  // (values) joined to ``schema.properties`` (labels). Empty values and
  // params not declared in the schema are skipped.
  const appliedFilters = useMemo<AppliedFilter[]>(() => {
    return Object.entries(formData).flatMap(([key, value]) => {
      if (value === '' || value == null) return [];
      const property = schema.properties[key];
      if (!property) return [];
      const rawValue = Array.isArray(value) ? value.join(', ') : String(value);
      return [
        {
          key,
          fieldLabel: (property.title as string) ?? key,
          valueLabel: resolveValueLabel(property, rawValue),
        },
      ];
    });
  }, [formData, schema]);

  const onCancel = (_submitted: Record<string, unknown>) => {
    const cleaned = {};
    history.push({
      pathname: location.pathname,
      search: qs.stringify(cleaned),
    });
    setIsExpanded(true);
    setFormData({});
    setResetKey((k) => k + 1);
  };

  const onSubmit = (submitted: Record<string, unknown>) => {
    const cleaned = Object.fromEntries(
      Object.entries(submitted).filter(
        ([, value]) => value !== '' && value !== null && value !== undefined,
      ),
    );
    history.push({
      pathname: location.pathname,
      search: qs.stringify(cleaned),
    });
    setIsExpanded(false);
  };

  return (
    <div className="filter-form" ref={containerRef}>
      <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <div>
          {!isExpanded && appliedFilters.length > 0 ? (
            <div className="applied-filters">
              <span className="applied-filters-label">
                {intl.formatMessage(messages.appliedFilters)}
              </span>
              {appliedFilters.map(({ key, fieldLabel, valueLabel }) => (
                <span key={key} className="applied-filter">
                  <span className="applied-filter-field">{fieldLabel}:</span>{' '}
                  <span className="applied-filter-value">{valueLabel}</span>
                </span>
              ))}
              <Button
                className="ui primary right floated button"
                slot="trigger"
              >
                Alterar
              </Button>
            </div>
          ) : (
            <h2>
              <Button slot="trigger">{schema.title}</Button>
            </h2>
          )}
        </div>
        <DisclosurePanel>
          <Form
            key={resetKey}
            description={intl.formatMessage(messages.formDescription)}
            isEditForm={false}
            textButtons={true}
            submitLabel={intl.formatMessage(messages.submitLabel)}
            cancelLabel={intl.formatMessage(messages.cancelLabel)}
            onSubmit={onSubmit}
            onCancel={onCancel}
            schema={schema}
            formData={formData}
          />
        </DisclosurePanel>
      </Disclosure>
      <div className="results">
        {items && items.length > 0 ? <ResultsComponent items={items} /> : null}
      </div>
    </div>
  );
}

export default FilterForm;
