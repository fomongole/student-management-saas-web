import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings2, Save, Calendar, Globe, Landmark } from 'lucide-react';
import { useSchoolConfig, useUpdateSchoolConfig } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SchoolSettings() {
  const { data: config, isLoading } = useSchoolConfig();
  const { mutate: updateConfig, isPending } = useUpdateSchoolConfig();
  
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      current_academic_year: 2026,
      current_term: 1,
      currency_symbol: 'UGX'
    }
  });

  // Sync form with backend data when loaded
  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const onSubmit = (data: any) => {
    updateConfig(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Settings2 className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">School Configuration</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-500" /> 
            Active Academic Period
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Setting this will update the default view for all Teachers, Students, and Parents.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Year Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Active Academic Year</label>
              <input 
                type="number" 
                {...register('current_academic_year', { valueAsNumber: true })} 
                placeholder="e.g. 2026"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5 border"
              />
            </div>

            {/* Term Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Active Term</label>
              <select 
                {...register('current_term', { valueAsNumber: true })} 
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value={1}>Term One (1)</option>
                <option value={2}>Term Two (2)</option>
                <option value={3}>Term Three (3)</option>
              </select>
            </div>

            {/* Regional Settings */}
            <div className="md:col-span-2 pt-4">
               <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center mb-4">
                <Globe className="w-4 h-4 mr-2 text-primary-500" /> 
                Localization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      {...register('currency_symbol')} 
                      className="block w-full rounded-lg border-gray-300 pl-10 sm:text-sm p-2.5 border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button 
              type="submit" 
              disabled={isPending || !isDirty}
              className="flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving Changes...' : <><Save className="w-5 h-5 mr-2" /> Save Configuration</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}