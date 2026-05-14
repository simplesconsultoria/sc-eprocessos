import { useEffect, useState } from 'react';
import { TableBody } from 'react-aria-components';
import { Table } from '@plone/components';
import { TableHeader } from '@plone/components';
import { Row } from '@plone/components';
import { Column } from '@plone/components';
import { Cell } from 'react-aria-components';
import PaginationRaw from '@plone/volto/components/theme/Pagination/Pagination';

// Volto's ``Pagination`` is exported through ``injectIntl``; the generated
// ``.d.ts`` reflects that and loses the underlying props. Re-declare locally.
const Pagination = PaginationRaw as unknown as React.FC<{
  current: number;
  total: number;
  pageSize?: number;
  pageSizes?: (number | string)[];
  onChangePage: (event: unknown, data: { value: number }) => void;
  onChangePageSize?: (event: unknown, data: { value: number }) => void;
}>;

export interface DataColumn {
  id: string;
  className: string;
  children: React.ReactNode;
}

export interface DataItemCol {
  id: string;
  className: string;
  textValue: string;
  children: React.ReactNode;
}

/**
 * Build a ``DataColumn`` where the CSS class matches the column id.
 * Use a plain object literal when ``className`` needs to differ from ``id``.
 */
export const column = (id: string, children: React.ReactNode): DataColumn => ({
  id,
  className: id,
  children,
});

/**
 * Build a ``DataItemCol`` where the CSS class matches the cell id.
 * Use a plain object literal when ``className`` needs to differ from ``id``.
 */
export const cell = (
  id: string,
  textValue: string,
  children: React.ReactNode,
): DataItemCol => ({ id, className: id, textValue, children });

interface TabelaPaginadaProps {
  label: string;
  /** CSS class applied to the table. */
  className?: string;
  noResultsMessage: string;
  columns: DataColumn[];
  items: Record<string, DataItemCol>[];
  /** CSS class applied to each ``<Row>`` (e.g. "sessao", "norma"). */
  rowClassName: string;
  /** Items per page. Defaults to 25. */
  size?: number;
}

const TabelaPaginada = ({
  label,
  className,
  noResultsMessage,
  columns,
  items,
  rowClassName,
  size = 25,
}: TabelaPaginadaProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Reset to the first page whenever the underlying items change (e.g.
  // a new filter is applied) — otherwise a user lingering on page 3 of
  // the previous results would land mid-way through the fresh ones.
  useEffect(() => {
    setCurrentPage(0);
  }, [items]);

  const total = size ? Math.max(1, Math.ceil(items.length / size)) : 1;
  const safePage = Math.min(currentPage, total - 1);
  const slice = size
    ? items.slice(safePage * size, (safePage + 1) * size)
    : items;

  return (
    <>
      <Table
        aria-label={label}
        className={['full', 'paginada', className].filter(Boolean).join(' ')}
      >
        <TableHeader>
          {columns.map((col, idx) => (
            <Column
              key={col.id}
              className={`column ${col.className}`}
              isRowHeader={idx === 0}
            >
              {col.children}
            </Column>
          ))}
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <p className="noResults">{noResultsMessage}</p>
          )}
        >
          {slice.map((item, idx) => {
            return (
              <Row key={`${idx}`} className={rowClassName}>
                {columns.map((col) => {
                  const itemCol = item[col.id];
                  return (
                    <Cell
                      key={`${idx}-${col.id}`}
                      className={`value ${itemCol.className}`}
                      textValue={itemCol.textValue}
                    >
                      {itemCol.children}
                    </Cell>
                  );
                })}
              </Row>
            );
          })}
        </TableBody>
      </Table>
      {size && total > 1 && (
        <Pagination
          current={safePage}
          total={total}
          onChangePage={(_event: unknown, { value }: { value: number }) =>
            setCurrentPage(value)
          }
        />
      )}
    </>
  );
};

export default TabelaPaginada;
