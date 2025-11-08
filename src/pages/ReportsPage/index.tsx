import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, BarChart, PieChart, LineChart, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReports } from "./hooks/useReports";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0ea5e9", "#8b5cf6", "#f43f5e", "#eab308", "#22c55e", "#64748b", "#ec4899", "#14b8a6"];

const getChartLabel = ({ name, value }: { name: string; value: number }) => `${name}: ${value}`;

export default function ReportsPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: reports, isLoading, error } = useReports({
    startDate: dateRange.from || subDays(new Date(), 30),
    endDate: dateRange.to || new Date(),
  });

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const renderLoadingState = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <Card className="col-span-full">
      <CardContent className="pt-6 text-center text-destructive">
        <p>Erro ao carregar relatórios: {(error as Error)?.message || "Ocorreu um erro desconhecido."}</p>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange as any}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? renderLoadingState() : error ? renderErrorState() : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Manifestações por Tipo */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <PieChart className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg font-semibold">Manifestações por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reports?.byType && reports.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={reports.byType}
                        dataKey="count"
                        nameKey="tipo"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={getChartLabel}
                      >
                        {reports.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} (${((value as number) / reports.byType.reduce((sum, item) => sum + item.count, 0) * 100).toFixed(1)}%)`, name]} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manifestações por Status */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BarChart className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg font-semibold">Manifestações por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reports?.byStatus && reports.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={reports.byStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manifestações ao Longo do Tempo */}
            <Card className="lg:col-span-full">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <LineChart className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-lg font-semibold">Manifestações ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {reports?.overTime && reports.overTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={reports.overTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(dateStr) => format(new Date(dateStr), "dd/MM", { locale: ptBR })} />
                      <YAxis />
                      <Tooltip labelFormatter={(label) => format(new Date(label), "dd/MM/yyyy", { locale: ptBR })} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}