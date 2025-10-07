async function fetchRandomArticleEdits() {
  const headers = {
    'User-Agent': 'MediaWiki REST API docs examples/0.1 (https://meta.wikimedia.org/wiki/User:APaskulin_(WMF))'
  };

  try {
    // First, get a random Wikipedia article
    const randomUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*';
    const randomResponse = await fetch(randomUrl);
    const randomData = await randomResponse.json();
    pageTitle = randomData.query.random[0].title;

    headerInfo.innerHTML = `Loading edits for: ${pageTitle}...`;

    // Fetch all revisions (up to 1000 with pagination)
    let continueToken = null;

    while (allRevisions.length < 1000) {
      const historyUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvlimit=500&rvdir=newer&format=json&origin=*${continueToken ? '&rvcontinue=' + continueToken : ''}`;
      const historyResponse = await fetch(historyUrl);
      const historyData = await historyResponse.json();
      const page = historyData.query.pages[Object.keys(historyData.query.pages)[0]];

      if (page.revisions) {
        allRevisions = allRevisions.concat(page.revisions);
      }

      if (historyData.continue && historyData.continue.rvcontinue && allRevisions.length < 1000) {
        continueToken = historyData.continue.rvcontinue;
      } else {
        break;
      }
    }

    // Get the original article HTML (first revision)
    const firstRevId = allRevisions[0].revid;
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=parse&oldid=${firstRevId}&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();
    revisionHtml[0] = contentData.parse.text['*'];

    displayRevision();
  } catch (error) {
    headerInfo.innerHTML = 'Error loading data: ' + error.message;
  }
}

// Start screen logic
async function checkArticleEdits(articleName) {
  try {
    articleInfo.textContent = 'Checking article...';
    startGameBtn.disabled = true;

    const historyUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleName)}&prop=revisions&rvlimit=1&format=json&origin=*`;
    const response = await fetch(historyUrl);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1') {
      articleInfo.textContent = 'Article not found. Please try another.';
      selectedArticle = null;
      updateShareUrl();
      return;
    }

    // Fetch revision count
    const countUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleName)}&prop=revisions&rvlimit=500&format=json&origin=*`;
    const countResponse = await fetch(countUrl);
    const countData = await countResponse.json();
    const page = countData.query.pages[Object.keys(countData.query.pages)[0]];

    let revCount = 0;
    if (page.revisions) {
      revCount = page.revisions.length;
      // Note: This is approximate since Wikipedia limits to 500 revisions per query
      if (countData.continue) {
        revCount = '500+';
      }
    }

    selectedArticle = articleName;
    articleInfo.textContent = `Found: "${articleName}" with ${revCount} edits`;
    startGameBtn.disabled = false;
    updateShareUrl();
  } catch (error) {
    articleInfo.textContent = 'Error checking article: ' + error.message;
    selectedArticle = null;
    updateShareUrl();
  }
}

function updateShareUrl() {
  const chipCountInputValue = chipCountInput.value;
  const countdownInputValue = countdownInput.value;
  const multiplierInputValue = multiplierInput.value;
  if (selectedArticle && chipCountInputValue && countdownInputValue && multiplierInputValue) {
    const params = new URLSearchParams({
      article: selectedArticle,
      chips: chipCountInputValue,
      countdown: countdownInputValue,
      multiplier: multiplierInputValue
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    shareUrl.value = url;
  } else {
    shareUrl.value = '';
  }
}

async function loadRandomArticle() {
  try {
    randomArticleBtn.disabled = true;
    articleInfo.textContent = 'Loading random article...';

    const randomUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*';
    const response = await fetch(randomUrl);
    const data = await response.json();
    const articleName = data.query.random[0].title;

    articleInput.value = articleName;
    await checkArticleEdits(articleName);
  } catch (error) {
    articleInfo.textContent = 'Error loading random article: ' + error.message;
  } finally {
    randomArticleBtn.disabled = false;
  }
}

function startGame() {
  pageTitle = selectedArticle;
  chipCount = parseInt(chipCountInput.value);
  countdownTime = parseInt(countdownInput.value);
  rewardMultiplier = parseInt(multiplierInput.value);
  startingChips = chipCount;
  totalChipsInserted = startingChips;
  totalChipsWon = 0;
  chipPileCount.textContent = chipCount;

  startScreen.classList.add('hidden');
  container.classList.remove('hidden');

  fetchArticleEdits(pageTitle);
}

async function fetchArticleEdits(articleName) {
  try {
    headerInfo.innerHTML = `Loading edits for: ${articleName}...`;

    // Fetch all revisions (up to 1000 with pagination)
    allRevisions = [];
    let continueToken = null;

    while (allRevisions.length < 1000) {
      const historyUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleName)}&prop=revisions&rvlimit=500&rvdir=newer&format=json&origin=*${continueToken ? '&rvcontinue=' + continueToken : ''}`;
      const historyResponse = await fetch(historyUrl);
      const historyData = await historyResponse.json();
      const page = historyData.query.pages[Object.keys(historyData.query.pages)[0]];

      if (page.revisions) {
        allRevisions = allRevisions.concat(page.revisions);
      }

      if (historyData.continue && historyData.continue.rvcontinue && allRevisions.length < 1000) {
        continueToken = historyData.continue.rvcontinue;
      } else {
        break;
      }
    }

    // Get the original article HTML (first revision)
    const firstRevId = allRevisions[0].revid;
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=parse&oldid=${firstRevId}&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();
    revisionHtml[0] = contentData.parse.text['*'];

    displayRevision();
  } catch (error) {
    headerInfo.innerHTML = 'Error loading data: ' + error.message;
  }
}

// Event listeners for start screen
articleInput.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  if (value) {
    checkArticleEdits(value);
  } else {
    selectedArticle = null;
    articleInfo.textContent = '';
    startGameBtn.disabled = true;
    updateShareUrl();
  }
});

chipCountInput.addEventListener('input', () => {
  updateShareUrl();
});

countdownInput.addEventListener('input', () => {
  updateShareUrl();
});

multiplierInput.addEventListener('input', () => {
  updateShareUrl();
  const multiplier = multiplierInput.value;
  multiplierText.textContent = `${multiplier}x`;
});

randomArticleBtn.addEventListener('click', loadRandomArticle);
startGameBtn.addEventListener('click', startGame);

// Copy share URL button
copyShareUrlBtn.addEventListener('click', async () => {
  const shareUrlValue = shareUrl.value;
  if (shareUrlValue) {
    try {
      await navigator.clipboard.writeText(shareUrlValue);
      const btn = copyShareUrlBtn;
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
});

// Check for URL parameters on load
const urlParams = new URLSearchParams(window.location.search);
const articleParam = urlParams.get('article');
const chipsParam = urlParams.get('chips');
const countdownParam = urlParams.get('countdown');
const multiplierParam = urlParams.get('multiplier');

if (articleParam) {
  articleInput.value = articleParam;
  if (chipsParam) {
    chipCountInput.value = chipsParam;
  }
  if (countdownParam) {
    countdownInput.value = countdownParam;
  }
  if (multiplierParam) {
    multiplierInput.value = multiplierParam;
    multiplierText.textContent = `${multiplierParam}x`;
  }
  checkArticleEdits(articleParam);
} else {
  // Load a random article on boot if no URL params
  loadRandomArticle();
}
