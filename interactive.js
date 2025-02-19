<script type="module">
  import { createSignal, createEffect } from "https://cdn.jsdelivr.net/npm/solid-js@1.8.0/dist/solid.js";
  import { render } from "https://cdn.jsdelivr.net/npm/solid-js@1.8.0/web/dist/web.js";

  function Timeline() {
    const [artists, setArtists] = createSignal([]);
    const [hoveredArtist, setHoveredArtist] = createSignal(null);

    // Load the artists.json data
    fetch("artists.json")
      .then((response) => response.json())
      .then((data) => setArtists(data));

    const minYear = () =>
      Math.min(...artists().map((a) => parseInt(a.yearsActive[0])));
    const maxYear = () =>
      Math.max(
        ...artists().map((a) => parseInt(a.yearsActive[1]) || new Date().getFullYear())
      );

    function getArtistStyle(artist) {
      const startYear = parseInt(artist.yearsActive[0]);
      const endYear = parseInt(artist.yearsActive[1]) || maxYear();
      const startPercent = ((startYear - minYear()) / (maxYear() - minYear())) * 100;
      const widthPercent = ((endYear - minYear()) / (maxYear() - minYear())) * 100 - startPercent;
      return `left: ${startPercent}%; width: ${widthPercent}%;`;
    }

    function getPopupStyle(artist) {
      const startYear = parseInt(artist.yearsActive[0]);
      const positionPercent = ((startYear - minYear()) / (maxYear() - minYear())) * 100;
      return `left: ${positionPercent}%; top: -50px; display: block;`;
    }

    return (
      <div class="timeline-container">
        <div class="timeline"></div>
        <For each={artists()}>
          {(artist) => (
            <div
              class="artist-marker"
              style={getArtistStyle(artist)}
              onMouseEnter={() => setHoveredArtist(artist)}
              onMouseLeave={() => setHoveredArtist(null)}
            ></div>
          )}
        </For>

        <Show when={hoveredArtist()}>
          <div class="artist-popup" style={getPopupStyle(hoveredArtist())}>
            <img src={hoveredArtist()?.imageUrl} width="50" height="50" />
            <h3>{hoveredArtist()?.name}</h3>
            <p>
              Active: {hoveredArtist()?.yearsActive[0]} -{" "}
              {hoveredArtist()?.yearsActive[1] || "Present"}
            </p>
          </div>
        </Show>
      </div>
    );
  }

  render(Timeline, document.getElementById("app"));
</script>
