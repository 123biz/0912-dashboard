import { CategoryDonut } from './components/CategoryDonut'
import { DealerCategoryHeatmap } from './components/DealerCategoryHeatmap'
import { DealerRankChart } from './components/DealerRankChart'
import { DetailTable } from './components/DetailTable'
import { DowChart } from './components/DowChart'
import { FilterBar } from './components/FilterBar'
import { Header } from './components/Header'
import { KpiCards } from './components/KpiCards'
import { MonthlyTrendChart } from './components/MonthlyTrendChart'
import { ProductTopChart } from './components/ProductTopChart'
import { useFilters } from './hooks/useFilters'

export default function App() {
  const { filters, update, reset, isDefault } = useFilters()

  const selectDealer = (id: number) => {
    update({ dealerIds: filters.dealerIds.includes(id) ? [] : [id] })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <FilterBar
        filters={filters}
        update={update}
        reset={reset}
        isDefault={isDefault}
      />

      <main className="mx-auto max-w-[1400px] space-y-4 px-6 py-6">
        <KpiCards filters={filters} />

        <MonthlyTrendChart filters={filters} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DealerRankChart filters={filters} onSelectDealer={selectDealer} />
          <CategoryDonut filters={filters} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ProductTopChart filters={filters} />
          <DowChart filters={filters} />
        </div>

        <DealerCategoryHeatmap filters={filters} />

        <DetailTable filters={filters} />
      </main>

      <footer className="mx-auto max-w-[1400px] px-6 pb-10">
        <p className="text-xs text-neutral-400">
          본 대시보드의 데이터는 시연용 가상 데이터입니다.
        </p>
      </footer>
    </div>
  )
}
