<script lang="ts">
	import { socket } from '$lib/websocketConnection';

	const { children } = $props();
	let loading = $state(true);

	socket.on('connect', () => {
		loading = false;
	});
</script>

{#if loading}
	connecting...
{:else}
	{@render children()}
{/if}
