
import { lazy, Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

// Lazy load chart components
const ReadingChart = lazy(() => import('./ReadingChart'));
const CategoryChart = lazy(() => import('./CategoryChart'));

// Chart loading skeletons with proper dimensions
const ChartSkeleton = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <Card className="bg-white/5 border-white/10">
    <CardHeader>
      <CardTitle className="text-white flex items-center">
        <Icon className="w-5 h-5 mr-2 text-wikitok-red" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full bg-white/10" />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto bg-white/10" />
            <Skeleton className="h-4 w-16 mx-auto bg-white/10" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto bg-white/10" />
            <Skeleton className="h-4 w-16 mx-auto bg-white/10" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto bg-white/10" />
            <Skeleton className="h-4 w-16 mx-auto bg-white/10" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Lazy Reading Chart Component
export const LazyReadingChart = ({ history }: { history: any[] }) => (
  <Suspense fallback={<ChartSkeleton title="Weekly Progress" icon={TrendingUp} />}>
    <ReadingChart history={history} />
  </Suspense>
);

// Lazy Category Chart Component
export const LazyCategoryChart = ({ stats }: { stats: any }) => (
  <Suspense fallback={<ChartSkeleton title="Favorite Categories" icon={PieChart} />}>
    <CategoryChart stats={stats} />
  </Suspense>
);

// Lazy Analytics Dashboard Component
export const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

export const LazyAnalyticsDashboardWrapper = () => (
  <Suspense fallback={
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-6 w-16 bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] bg-white/5 rounded-lg" />
        <Skeleton className="h-[400px] bg-white/5 rounded-lg" />
      </div>
    </div>
  }>
    <LazyAnalyticsDashboard />
  </Suspense>
);
