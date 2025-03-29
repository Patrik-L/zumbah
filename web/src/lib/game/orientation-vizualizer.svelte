<script lang="ts">
	import type { SimpleQuarternion } from '$lib/types';
	import { Canvas, T } from '@threlte/core';
	import { Quaternion } from 'quaternion';
	import { useGltf } from '@threlte/extras';
	const { orientationData }: { orientationData: SimpleQuarternion } = $props();
	const euler = $derived(new Quaternion(orientationData).toEuler());
</script>

<Canvas>
	<T.DirectionalLight position={[0, 10, 10]} intensity={6} castShadow />
	<T.PerspectiveCamera
		makeDefault
		position={[0, 0, 3]}
		oncreate={(ref: { lookAt: (arg0: number, arg1: number, arg2: number) => void }) => {
			ref.lookAt(0, 0, 0);
		}}
	/>

	<T.AmbientLight color={0xffffff} intensity={0.7} />

	{#await useGltf('/models/arrow.glb') then gltf}
		<T is={gltf.scene} rotation={euler}></T>
	{/await}
</Canvas>
