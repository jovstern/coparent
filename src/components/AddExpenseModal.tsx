import { Camera } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  splitRatio: number;
}

export default function AddExpenseModal({ isOpen, onClose, splitRatio }: AddExpenseModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add expense logic
    alert('Expense added!');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Expense</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Doctor visit, school supplies, etc."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500">
                  <option>Medical</option>
                  <option>Education</option>
                  <option>Clothing</option>
                  <option>Extracurricular</option>
                  <option>Childcare</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <select className="px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>ILS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Receipt (Optional)</label>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 rounded-md hover:border-primary-400 transition-colors"
                >
                  <Camera className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-600">Upload Receipt</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-50 rounded-md">
                <p className="text-sm text-zinc-700">
                  This expense will be split <span className="font-semibold">{splitRatio}/{100 - splitRatio}</span>
                </p>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit" className="bg-secondary-500 hover:bg-secondary-600">
                  Add Expense
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
