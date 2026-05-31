export async function GET() {
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Karawang&country=Indonesia&method=11",
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    const timings = result.data.timings;
    const hijri = result.data.date.hijri;
    const gregorian = result.data.date.gregorian;

    return Response.json({
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,

      hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} H`,
      gregorianDate: gregorian.date,

      city: "Karawang",
      province: "Jawa Barat",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to fetch prayer times",
      },
      {
        status: 500,
      }
    );
  }
}