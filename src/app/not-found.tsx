import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
        <div className="bg-teal-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
           <FileQuestion size={40} className="text-teal-600" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The machine or page you are looking for might have been moved or removed.
        </p>

        <div className="space-y-3">
          <Link 
            href="/products" 
            className="block w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
          >
            View All Machines
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} /> Go to Homepage
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest">
        Ali Enterprises • Industrial Solutions
      </p>
    </div>
  )
}