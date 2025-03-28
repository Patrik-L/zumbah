<script lang="ts">
	import QRCode from 'qrcode';

	let { width, value }: { width?: number; value: string } = $props();

	const generateQR = async (text: string) => {
		return await QRCode.toDataURL(text, { width, color: { light: '#00000000' } });
	};

	const qrImage = generateQR(value);
</script>

{#await qrImage}
	<div style:width="{width}px" style:height="{width}px">
		<p>Generating QR</p>
	</div>
{:then qr}
	<img src={qr} alt={qr} />
{/await}
