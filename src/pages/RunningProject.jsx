import React from 'react';

export default function RunningProject() {
  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-4xl mx-auto px-6 mt-12 text-left">
        
        {/* Page Header */}
        <div className="text-left mb-12">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">CONSTRUCTION</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
            Running Project 1
          </h1>
          <div className="h-1 w-20 bg-primary" />
        </div>

        {/* Main Cover Blueprint */}
        <div className="bg-dark-card border border-dark-border/40 overflow-hidden mb-12 shadow-2xl">
          <img 
            src="/img/project-9/zi bablu floor plan 2.png" 
            alt="Running Project Cover Office Layout" 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>

        {/* Details Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
          {/* Sub Image */}
          <div className="bg-dark-card border border-dark-border/40 overflow-hidden shadow-xl">
            <img 
              src="/img/project-9/zi bablu floor plan.png" 
              alt="Conference Room Layout Blueprint" 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Description Text */}
          <div className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed flex flex-col gap-4">
            <p>
              This corporate project is currently in the active construction phase, translating conceptual planning diagrams into a functional headquarters interior.
            </p>
            <p>
              The structural layout emphasizes optimal workflow partitioning, incorporating modern double-glazed meeting rooms, ergonomic open workspaces, and custom-designed acoustics for optimal productivity.
            </p>
            <p>
              Execution is running on schedule, using sustainable materials and energy-efficient building parameters. Handover and site inauguration are expected in the upcoming quarter.
            </p>
          </div>
        </div>

        {/* Bottom Detailed Blueprint */}
        <div className="bg-dark-card border border-dark-border/40 overflow-hidden shadow-2xl">
          <img 
            src="/img/project-9/zi bablu floor plan 1.png" 
            alt="Office Blueprint Details" 
            className="w-full h-auto object-cover"
          />
        </div>

      </div>
    </div>
  );
}
