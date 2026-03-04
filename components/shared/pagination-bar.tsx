import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function PaginationBar({ page, totalPages, limit, onPageChange, onLimitChange }: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-lg text-slate-600">Page {page} of {Math.max(totalPages, 1)}</p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button className="h-10 min-w-10 px-4">{page}</Button>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <select
          className="ml-2 h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
