import "./loading.css";

export default function Loading() {
    const titre = "Chargement...";
    const sousTitre = "Veuillez patienter pendant que nous préparons tout pour vous";

    return (
        <div className="flex flex-col items-center justify-center gap-10 min-h-screen min-w-screen bg-white dark:bg-gray-900">

            {/* Spinner à plusieurs anneaux concentriques */}
            <div className="relative size-40 flex items-center justify-center">

                {/* Anneau 1 — le plus grand, rotation lente */}
                <div className="anneau-1 absolute inset-0 rounded-full border-2 border-transparent
                    border-t-black/80 border-r-black/20
                    dark:border-t-white/80 dark:border-r-white/20"
                />

                {/* Anneau 2 — principal, vitesse moyenne */}
                <div className="anneau-2 absolute inset-2.5 rounded-full border-[3px] border-transparent
                    border-t-black border-r-black/40
                    dark:border-t-white dark:border-r-white/40"
                />

                {/* Anneau 3 — rotation inverse, plus rapide */}
                <div className="anneau-3 absolute inset-5.5 rounded-full border-2 border-transparent
                    border-b-black/60 border-l-black/20
                    dark:border-b-white/60 dark:border-l-white/20"
                />

                {/* Anneau 4 — le plus petit, rotation inverse lente */}
                <div className="anneau-4 absolute inset-8.5 rounded-full border border-transparent
                    border-b-black/30 border-l-black/10
                    dark:border-b-white/30 dark:border-l-white/10"
                />

                {/* Point central — légère pulsation */}
                <div className="size-2 rounded-full bg-black/40 dark:bg-white/40 point-central" />
            </div>

            {/* Texte — apparition progressive avec délai */}
            <div className="text-center space-y-3 max-w-xs apparition">

                {/* Titre avec légère pulsation d'opacité */}
                <h1 className="text-lg font-semibold tracking-tight text-black/90 dark:text-white/90 pulsation-lente">
                    {titre}
                </h1>

                {/* Sous-titre avec pulsation encore plus douce */}
                <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed pulsation-tres-lente">
                    {sousTitre}
                </p>
            </div>
        </div>
    );
}