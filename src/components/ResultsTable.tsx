import { FormatResult } from '@/lib/formatUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsTableProps {
  results: FormatResult[];
  detectedFormat: string;
  originalTokens: number;
  totalTime: number;
}

export const ResultsTable = ({ results, detectedFormat, originalTokens, totalTime }: ResultsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          Detected format: <span className="font-semibold text-foreground">{detectedFormat.toUpperCase()}</span>
          {' • '}
          Original tokens: <span className="font-semibold text-foreground">{originalTokens}</span>
          {' • '}
          Total time: <span className="font-semibold text-foreground">{totalTime.toFixed(2)}ms</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Time (ms)</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{result.format}</TableCell>
                <TableCell className="text-right">{result.tokens.toLocaleString()}</TableCell>
                <TableCell className="text-right">{result.time.toFixed(3)}</TableCell>
                <TableCell className="text-right">${result.cost.toFixed(6)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
