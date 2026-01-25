import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { Box } from "@mantine/core";

interface CustomTableProps<TData extends Record<string, any>> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
}

export const CustomizableMantineTable = <TData extends Record<string, any>>({
  columns,
  data = [],
  loading = false,
}: CustomTableProps<TData>) => {
  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MantineReactTable
        columns={columns}
        data={data}
        state={{ isLoading: loading }}
        enableColumnOrdering
        enablePagination
        enableSorting
        enableColumnFilters
        enableGlobalFilter
        enableStickyHeader
        enableFullScreenToggle={false}
        initialState={{
          density: "xs",
          pagination: { pageSize: 10, pageIndex: 0 },
        }}
        mantineTableContainerProps={{
          sx: { maxHeight: "calc(100vh - 210px)" },
        }}
      />
    </Box>
  );
};