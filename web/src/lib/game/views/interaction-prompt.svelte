<script>
	import { localState } from '../game-state.svelte';
</script>

<button onclick={() => (localState.hasInteracted = true)}> JOIN </button>

<style>
	button {
		position: fixed;
		display: flex;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: none;
		background-color: #f6bd60;
		font-family: 'Knewave', system-ui;
		font-size: 2em;
		margin: 5%;
		border-radius: 2rem;
		cursor: pointer;
	}

	button:active {
		background-color: #f6ae3c;
	}
</style>
