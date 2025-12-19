import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PollOption } from "@/lib/supabase";

interface ResultsChartProps {
  options: PollOption[];
  optionCounts: Record<string, number>;
  totalVotes: number;
  chartType?: "pie" | "bar";
}

const COLORS = [
  "hsl(168, 76%, 36%)",
  "hsl(220, 90%, 56%)",
  "hsl(280, 68%, 60%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 72%, 51%)",
  "hsl(210, 40%, 40%)",
];

export function ResultsChart({ options, optionCounts, totalVotes, chartType = "bar" }: ResultsChartProps) {
  const data = options.map((option, index) => ({
    name: option.option_text,
    value: optionCounts[option.id] || 0,
    percentage: totalVotes > 0 
      ? Math.round(((optionCounts[option.id] || 0) / totalVotes) * 100) 
      : 0,
    fill: COLORS[index % COLORS.length],
  }));

  if (chartType === "pie") {
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} votes (${data.find(d => d.name === name)?.percentage}%)`,
                name
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value} votes (${props.payload.percentage}%)`,
              "Votes"
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
