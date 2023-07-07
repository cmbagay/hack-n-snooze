"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showTrash = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        <div>
        ${showStar ? starBtn(story, currentUser) : ""}
        ${showTrash ? trashBtn(s) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** SUBMIT STORY */
async function submitStory(e) {
  console.debug("submitStory");
  e.preventDefault();

  const title = $("#submit-title").val();
  const url = $("#submit-url").val();
  const author = $("#submit-author").val();
  const username = currentUser.username;

  const story = await storyList.addStory(currentUser, {
    title,
    url,
    author,
    username,
  });

  const storyMarkup = generateStoryMarkup(story);
  $allStoriesList.prepend(storyMarkup);

  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStory);

/** FAVORITE STORIES */

function starBtn(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";

  return `<span class="star">
            <i class="${starType} fa-star"></i>
          </span>`;
}

function putFavoriteStoryList() {
  $favoriteStories.empty();
  hidePageComponents();

  for (let story of currentUser.favorites) {
    const favStory = generateStoryMarkup(story);
    $favoriteStories.append(favStory);
  }

  $favoriteStories.show();
}

async function toggleFavoriteStory(e) {
  console.debug("toggleFavoriteStory");

  const $target = $(e.target);
  const storyId = $($target.closest("li")).attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  //is star toggled?
  if ($target.hasClass("fas")) {
    //IS toggled
    //toggledStar -> remove star and set star to notToggled
    await currentUser.removeFavoriteStory(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    //NOT toggled
    await currentUser.addFavoriteStory(story);
    $target.closest("i").toggleClass("far fas");
  }
}

$allStoriesList.on("click", ".star", toggleFavoriteStory);

//trash story
function trashBtn() {
  return `<span class=trash>
            <i class="fas fa-trash-alt"></i>
          </span>`;
}

async function trashStory(e) {
  console.debug("trashStory");

  const storyId = $($(e.target).closest("li")).attr("id");

  await storyList.removeStory(currentUser, storyId);
}
