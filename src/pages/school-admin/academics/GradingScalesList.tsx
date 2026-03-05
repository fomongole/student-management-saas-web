import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Settings2, X, AlertCircle, Save } from 'lucide-react';

import { 
  gradingScaleSchema, 
  type GradingScaleFormValues, 
  type GradingScaleFormInput 
} from '@/schemas/academic.schema';

import { useGradingScales, useCreateGradingScale, useDeleteGradingScale } from '@/hooks/useGrades';
import { Skeleton } from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function GradingScalesList() {
  const { data: scales, isLoading } = useGradingScales();
  const { mutate: saveScale, isPending: isSaving } = useCreateGradingScale();
  const { mutate: deleteScale, isPending: isDeleting } = useDeleteGradingScale();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GradingScaleFormInput, any, GradingScaleFormValues>({
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

  const handleConfirmDelete = () => {
    if (scaleToDelete) {
      deleteScale(scaleToDelete, {
        onSettled: () => setScaleToDelete(null)
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 tracking-tight">Grading System</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define grade symbols, score boundaries, and aggregate points for your institution.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${isFormOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {isFormOpen ? <><X className="-ml-0.5 mr-1.5 h-4 w-4" /> Cancel</> : <><Plus className="-ml-0.5 mr-1.5 h-5 w-5" /> Add Grade Tier</>}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {isFormOpen && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center mb-6 text-gray-800 border-b border-gray-200/60 pb-3">
            <Settings2 className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-bold">Configure Grade Tier</h3>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 items-start">
            
            {/* Row 1 */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Symbol <span className="text-gray-400 font-normal">(e.g. A)</span></label>
              <input {...register('grade_symbol')} className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-3.5 bg-white transition-colors" placeholder="A" />
              {errors.grade_symbol && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.grade_symbol.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Score</label>
              <input type="number" {...register('min_score')} className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-3.5 bg-white transition-colors" placeholder="80" />
              {errors.min_score && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.min_score.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Score</label>
              <input type="number" {...register('max_score')} className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-3.5 bg-white transition-colors" placeholder="100" />
              {errors.max_score && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.max_score.message}</p>}
            </div>

            {/* Row 2 */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label <span className="text-gray-400 font-normal">(e.g. Distinction)</span></label>
              <input {...register('label')} className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-3.5 bg-white transition-colors" placeholder="Distinction" />
              {errors.label && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.label.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Points / Weight</label>
              <input type="number" {...register('points')} className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-3.5 bg-white transition-colors" placeholder="1" />
              {errors.points && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.points.message}</p>}
            </div>
            
            {/* Button neatly aligned in the grid */}
            <div className="w-full flex items-start pt-[26px]">
              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-sm disabled:opacity-50 transition-colors h-[42px]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save Grade Tier'}
              </button>
            </div>

          </form>

          <div className="mt-5 flex items-start p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-xs">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
            <p><strong>Tip:</strong> Saving a symbol that already exists (e.g., 'A') will update the existing rule rather than creating a duplicate.</p>
          </div>
        </div>
      )}

      {/* Tiers List */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grade Symbol</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score Range</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
              <th className="relative py-4 pl-3 pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4"><Skeleton className="h-12 w-full rounded-lg" /></td></tr>
            ) : scales?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Settings2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">No grading rules defined yet. Add your first tier above.</p>
                </td>
              </tr>
            ) : (
              scales?.sort((a, b) => b.max_score - a.max_score).map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-bold text-gray-900">
                    {tier.grade_symbol}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-600">
                    <span className="text-gray-900">{tier.min_score}</span> <span className="text-gray-400 mx-1.5">to</span> <span className="text-gray-900">{tier.max_score}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-800">
                    {tier.label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {tier.points}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <button 
                      onClick={() => setScaleToDelete(tier.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete Tier"
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

      <ConfirmDialog
        isOpen={!!scaleToDelete}
        onClose={() => setScaleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Grade Boundary"
        message="Are you sure you want to delete this grading scale? It may affect how future and past marks are displayed."
        confirmText="Yes, Delete Boundary"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}