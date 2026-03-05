import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Settings2 } from 'lucide-react';

import { gradingScaleSchema, type GradingScaleFormValues } from '@/schemas/academic.schema';
import { useGradingScales, useCreateGradingScale, useDeleteGradingScale } from '@/hooks/useGrades';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GradingScalesList() {
  const { data: scales, isLoading } = useGradingScales();
  const { mutate: saveScale, isPending } = useCreateGradingScale();
  const { mutate: deleteScale } = useDeleteGradingScale();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GradingScaleFormValues>({
    resolver: zodResolver(gradingScaleSchema),
  });

  const onSubmit = (data: GradingScaleFormValues) => {
    saveScale(data, {
      onSuccess: () => {
        reset();
        setIsFormOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Grading System
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Define grade symbols, score boundaries, and aggregate points.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            {isFormOpen ? 'Close Form' : <><Plus className="-ml-0.5 mr-1.5 h-5 w-5" /> Add Grade Tier</>}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {isFormOpen && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings2 className="w-5 h-5 mr-2 text-gray-400" />
            Configure Grade Tier
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
            
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Symbol (e.g. D1)</label>
              <input {...register('grade_symbol')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {errors.grade_symbol && <p className="mt-1 text-[10px] text-red-500">{errors.grade_symbol.message}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Score</label>
              <input type="number" {...register('min_score')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {errors.min_score && <p className="mt-1 text-[10px] text-red-500">{errors.min_score.message}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Score</label>
              <input type="number" {...register('max_score')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {errors.max_score && <p className="mt-1 text-[10px] text-red-500">{errors.max_score.message}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Label (e.g. Distinction)</label>
              <input {...register('label')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {errors.label && <p className="mt-1 text-[10px] text-red-500">{errors.label.message}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
              <div className="flex gap-2">
                <input type="number" {...register('points')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                <button type="submit" disabled={isPending} className="px-3 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
              {errors.points && <p className="mt-1 text-[10px] text-red-500">{errors.points.message}</p>}
            </div>
          </form>
          <p className="mt-4 text-xs text-gray-500">
            *Tip: If you save a symbol that already exists, it will update the existing rule.
          </p>
        </div>
      )}

      {/* Tiers List */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Grade Symbol</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score Range</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Label</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Points</th>
              <th className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
            ) : scales?.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No grading rules defined yet.</td></tr>
            ) : (
              // Sort by max score descending so A is at the top
              scales?.sort((a, b) => b.max_score - a.max_score).map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {tier.grade_symbol}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tier.min_score} - {tier.max_score}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-700">
                    {tier.label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tier.points} pts
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button 
                      onClick={() => window.confirm('Delete this grade boundary?') && deleteScale(tier.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}