async function getSurah(id: string) {

  const response = await fetch(
    `https://api.quran.gading.dev/surah/${id}`,
    {
      cache: "no-store",
    }
  );

  const result = await response.json();

  return result.data;
}

export default async function SurahDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const surah = await getSurah(id);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 pb-20">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <a
            href="/quran"
            className="text-emerald-400 text-sm"
          >
            ← Kembali
          </a>

          <h1 className="text-4xl font-bold mt-4">
            {surah.name.transliteration.id}
          </h1>

          <p className="text-slate-400 mt-2">
            {surah.name.translation.id}
          </p>

          <div className="text-5xl mt-6 text-right">
            {surah.name.short}
            
          </div>
         <audio
  controls
  className="w-full mt-6 rounded-2xl"
>

  <source
    src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${id}.mp3`}
    type="audio/mpeg"
  />

</audio>

        </div>

        {/* AYAT */}

        <div className="space-y-6">

          {surah.verses.map(
            (ayah: any, index: number) => (

              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >

                {/* NOMOR */}

                <div className="flex items-center justify-between mb-6">

                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">

                    {ayah.number.inSurah}

                  </div>

                </div>

                {/* ARAB */}

                <p className="text-3xl leading-loose text-right">

                  {ayah.text.arab}

                </p>

                {/* LATIN */}

                <p className="text-emerald-400 mt-6 italic leading-relaxed">

                  {ayah.text.transliteration.en}

                </p>
                <audio
  controls
  className="w-full mt-6"
>

  <source
    src={ayah.audio.primary}
    type="audio/mpeg"
  />

</audio>

                {/* TERJEMAHAN */}


                <p className="text-slate-300 mt-4 leading-relaxed">

                  {ayah.translation.id}

                </p>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}