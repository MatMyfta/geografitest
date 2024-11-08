import { writable, get } from "svelte/store";

export let totalPoints = writable(0);
export let scorePercentage = writable(0);
export let maxPoints = writable(0);
export let remainingRegions = writable([]);
export let selectedArea = writable("regions");
export let clickedRegions = writable(new Set());
export let correctRegions = writable(new Set());

export function resetGameVariables() {
  totalPoints.set(0);
  scorePercentage.set(0);
  maxPoints.set(0);
  remainingRegions.set([]);
  clickedRegions.set(new Set());
  correctRegions.set(new Set());
}

export function askNextRegion() {
  let remaining = [];

  remainingRegions.update((r) => {
    remaining = [...r];
    return remaining;
  });

  if (remaining.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * remaining.length);
  const feature = remaining[randomIndex];

  remaining.splice(randomIndex, 1);
  // @ts-ignore
  remainingRegions.set(remaining);

  return feature;
}

export function updateScore(points, maxPoints) {
  scorePercentage.set(Math.round((points / maxPoints) * 100));
}

export function isCorrectRegion(feature, currentRegion, selectedArea) {
  return (
    (selectedArea === "regions" && feature.properties.reg_name === currentRegion?.properties.reg_name) ||
    (selectedArea === "provinces" && feature.properties.prov_name === currentRegion?.properties.prov_name)
  );
}

export function calculatePoints(errors) {
  return Math.max(3 - errors, 0);
}
