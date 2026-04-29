import { useState } from 'react';
import { X, Lightbulb, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { MOCK_RISKS } from '../mockData';

interface ExamplesDrawerProps {
  department: string;
  isVisible: boolean;
}

export default function ExamplesDrawer({ department, isVisible }: ExamplesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const examples = MOCK_RISKS.filter(r => r.department === department);

  if (!isVisible) return null;

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Backdrop - only visible when open */}
      <div 
        className={`examples-backdrop fixed inset-0 z-[1100] bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Persistent Trigger Button & Label */}
      <div 
        className={`fixed top-1/2 z-[1210] flex items-center gap-3 bouncy-transition ${isOpen ? 'right-[432px]' : 'right-8'} -translate-y-1/2`}
      >
        {!isOpen && (
          <div 
            className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 shadow-sm transition-all hover:bg-orange-100 whitespace-nowrap"
            onClick={toggleOpen}
          >
            <Search size={13} className="text-orange-600" />
            <span className="text-[11px] font-semibold text-orange-700">Examples</span>
          </div>
        )}
        
        <button 
          onClick={toggleOpen}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-xl transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-90"
          title={isOpen ? "Close Examples" : "Show Examples"}
        >
          {isOpen ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
        </button>
      </div>

      {/* Floating Drawer Card */}
      <div className={`examples-drawer fixed right-0 top-0 bottom-0 z-[1200] m-4 flex w-[400px] flex-col bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto border border-slate-200 rounded-2xl overflow-hidden ${isOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Lightbulb size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Examples</h2>
              <p className="text-xs text-slate-500">{department || "Select Department"}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {!department ? (
            <div className="text-center text-sm text-slate-500 py-10">Please select a department to see relevant examples.</div>
          ) : examples.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-10">No examples found for this department.</div>
          ) : (
            examples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-800">{ex.process_name}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Risk Description</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{ex.risk_description}</p>
                  </div>
                  
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Possible Causes</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{ex.possible_causes}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Root: {ex.root_cause}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      {ex.event_type}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Controls</span>
                    <p className="text-sm text-slate-700 leading-relaxed mb-2">{ex.control_description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {ex.control_type}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Treatment: {ex.risk_treatment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
