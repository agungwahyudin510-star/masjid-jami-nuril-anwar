export async function GET() {
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=11"
    );

    const data = await response.json();

    return Response.json(data.data.timings);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 }
    );
  }
}