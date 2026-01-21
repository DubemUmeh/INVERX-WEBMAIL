import { Diamond, Bolt, Cuboid, Globe, Rocket } from 'lucide-react';

export default function SocialProof() {
  return (
    <section className="w-full bg-white dark:bg-neutral-900 py-10 border-y border-[#ededed] dark:border-neutral-800">
      <div className="px-4 md:px-10 lg:px-40 flex justify-center">
        <div className="max-w-[960px] w-full flex flex-col gap-6 items-center">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest text-center">Trusted by high-performing teams at</p>
          <div className="flex flex-wrap justify-center gap-10 opacity-60 grayscale dark:invert">
            {/* <!-- Using material icons as logo placeholders --> */}
            <div className="flex items-center gap-2 font-bold text-lg"><span className="material-symbols-outlined"><Diamond /></span>Acme Inc</div>
            <div className="flex items-center gap-2 font-bold text-lg"><span className="material-symbols-outlined"><Bolt /></span>Voltwave</div>
            <div className="flex items-center gap-2 font-bold text-lg"><span className="material-symbols-outlined"><Cuboid /></span>CubeSpace</div>
            <div className="flex items-center gap-2 font-bold text-lg"><span className="material-symbols-outlined"><Globe /></span>Globex</div>
            <div className="flex items-center gap-2 font-bold text-lg"><span className="material-symbols-outlined"><Rocket /></span> Starfleet</div>
          </div>
        </div>
      </div>
    </section>
  )
}