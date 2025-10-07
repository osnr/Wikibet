// Shared function to show end game screen
function showEndGameScreen() {
  isGameEnded = true;

  clearInterval(countdownInterval);
  stopAllSounds();
  clearAllBets();

  // Get current revision info
  const currentRev = allRevisions[currentRevisionIndex];
  const revisionDate = currentRev ? new Date(currentRev.timestamp).toLocaleString() : 'N/A';

  // Calculate stats
  const netGain = chipCount - totalChipsInserted;

  // Populate end game screen
  endArticle.textContent = pageTitle;
  endRevision.textContent = `${currentRevisionIndex + 1} of ${allRevisions.length}`;
  endRevisionDate.textContent = revisionDate;
  endChipsInserted.textContent = totalChipsInserted;
  endChipsWon.textContent = totalChipsWon;
  endCurrentChips.textContent = chipCount;
  endNetGain.textContent = netGain >= 0 ? `+${netGain}` : netGain;
  endNetGain.style.color = netGain >= 0 ? 'green' : 'red';

  // Hide other screens and show end game screen
  gameOverScreen.classList.add('hidden');
  endGameScreen.classList.remove('hidden');
}

// Clear all bets button
clearBetsBtn.addEventListener('click', clearAllBets);

// End Game button
endGameBtn.addEventListener('click', showEndGameScreen);

// End game from game over screen
endGameFromOverBtn.addEventListener('click', showEndGameScreen);

// Return to Start button
returnToStartBtn.addEventListener('click', () => {
  endGameScreen.classList.add('hidden');
  container.classList.add('hidden');
  startScreen.classList.remove('hidden');
  gameOverScreen.classList.add('hidden');

  // Reset game state
  allRevisions = [];
  revisionHtml = [];
  currentRevisionIndex = 0;
  isPaused = false;
  pausedCountdown = 0;
  totalChipsInserted = 0;
  totalChipsWon = 0;
  pauseBtn.textContent = 'Pause';

  // Clear placed chips and content
  document.querySelectorAll('.placed-chip').forEach(chip => chip.remove());
  content.innerHTML = '';
});
