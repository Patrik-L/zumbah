import type { SimpleQuarternion } from '$lib/types';
import { Quaternion } from 'quaternion';
import constQuaternions from 'quaternion';

export const calculateCloseness = (
	a: SimpleQuarternion | undefined,
	b: SimpleQuarternion | undefined
) => {
	if (a === undefined || b === undefined) {
		return 1;
	}

	const first = new Quaternion(a).toEuler();
	const second = new Quaternion(b).toEuler();

	let totalDiff = 0;

	for (let i = 0; i < first.length; i++) {
		totalDiff += Math.abs(first[i] - second[i]);
	}

	return (totalDiff = totalDiff / (Math.PI * 3));
};

export const getClampedPercentage = (closeness: number, closeEnoughPercentage = 0.9) => {
	const closenessPercentage = Math.min(
		Math.max(100 - (closeness - (1 - closeEnoughPercentage)) * 100, 0),
		100
	);

	return closenessPercentage;
};
