import React from 'react';
import { servicesData } from '../data/projects';
import { 
  MdOutlineArchitecture, 
  MdOutlineLayers, 
  MdOutlineWeekend, 
  MdOutlineHomeWork, 
  MdOutlineSlowMotionVideo 
} from 'react-icons/md';

const iconMap = {
  MdOutlineArchitecture: MdOutlineArchitecture,
  MdOutlineLayers: MdOutlineLayers,
  MdOutlineWeekend: MdOutlineWeekend,
  MdOutlineHomeWork: MdOutlineHomeWork,
  MdOutlineSlowMotionVideo: MdOutlineSlowMotionVideo
};

export default function Services() {
  const processSteps = [
    {
      num: '01',
      title: 'Conceptual Phase',
      desc: 'Collaborative client workshops, site feasibility analyses, spatial programming layout draft, and moodboard alignment.'
    },
    {
      num: '02',
      title: '3D Visualisation',
      desc: 'Mapping CAD structures into photorealistic 3D environments, texturing, custom lighting schemes, and cinematic video walkthroughs.'
    },
    {
      num: '03',
      title: 'Detailed Blueprints',
      desc: 'Creation of working drawings, floorplans, plumbing layouts, electrical outlines, and engineering certifications.'
    },
    {
      num: '04',
      title: 'Execution & Support',
      desc: 'Supervising the structural builders, selecting exact materials, verifying safety parameters, and hands-on site handover.'
    }
  ];

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* Page Header */}
        <div className="text-left mb-16">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">SERVICES</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
            Design Solutions
          </h1>
          <div className="h-1 w-20 bg-primary" />
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {servicesData.map((service) => {
            const IconComponent = iconMap[service.icon] || MdOutlineArchitecture;
            return (
              <div key={service.id} className="glass-panel p-8 flex gap-6 items-start hover-glow">
                <div className="w-14 h-14 rounded-none bg-dark-card border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <IconComponent size={28} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold font-heading text-white mb-2">{service.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Timeline */}
        <div className="border-t border-dark-border/20 pt-16">
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">WORKFLOW</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">Our Construction Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[1px] bg-primary/25 z-0" />

            {processSteps.map((step) => (
              <div key={step.num} className="flex flex-col items-center md:items-start text-center md:text-left z-10">
                <div className="w-12 h-12 rounded-full border border-primary bg-dark text-primary font-heading font-extrabold flex items-center justify-center mb-6 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-md font-bold font-heading text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
