<script>
	import rawAudio from '$lib/assets/game-music.mp3';

	const song = new Audio(rawAudio);
	song.volume = 0.2;
	song.loop = true;
	song.play();
</script>
