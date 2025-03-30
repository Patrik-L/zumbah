<script lang="ts">
	import { socket } from '$lib/websocketConnection';
	import { Jellyfish } from 'svelte-loading-spinners';

	const { children } = $props();
	let loading = $state(true);

	socket.on('connect', () => {
		loading = false;
	});
</script>

{#if loading}
	<div class="loading">
		<Jellyfish size="72" color="#84a59d"></Jellyfish>
		<h1>Connecting...</h1>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.loading {
		position: fixed;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}
</style>
