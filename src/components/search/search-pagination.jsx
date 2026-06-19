import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { useTranslation } from "react-i18next"
import { buildPageRange } from "@/lib/utils"

// ---------------------------------------------------------------------------
// SearchPagination — composant de pagination
// ---------------------------------------------------------------------------catalog-pagination

/**
 * Pagination de la recherche.
 *
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   onPageChange: (page: number) => void
 * }} props
 */
export function SearchPagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation("search")

  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {/* Bouton Précédent */}
        <PaginationItem>
          <PaginationPrevious
            text={t("pagination.previous")}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* Numéros de pages avec ellipses */}
        {pages.map((page, i) =>
          page === null ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Bouton Suivant */}
        <PaginationItem>
          <PaginationNext
            text={t("pagination.next")}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}