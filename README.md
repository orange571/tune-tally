# Tune Tally

[Live Demo](https://tunetally.herokuapp.com)

Tune Tally is a poll generator website specifically for songs. What makes this site different from your standard poll generator site such as strawpoll.me, is that poll creators have the option to make the poll options dynamic. Participants of the poll can have the option to add songs to the poll and change their vote while the poll is active. This creates a flexible experience for friends or team members to collectively choose a song or songs.

Poll can be customized to:
* Allow Participants to Add Songs
* Have a Deadline
* Limit the Total Number of Votes Allowed
* Require Participants to be Logged In to Allow Them to Change their Vote in the Future

Other Features:
* Auto-Suggest Feature. Tune Tally utilizes the Spotify Search API to suggest song titles and artists as you type.
* Moderation. Poll owners have the ability to remove songs from the poll.
* Dashboard. Keeps track of polls you created and polls you voted in that required login.

## Background And What Tune Tally aims to solve

The idea to create this website spurred from an experience working with an online music community that wanted to create community covers of songs. The method that was used to determined which song to cover involved sharing a google form in which they would list what songs they wanted.

I felt that this method had a couple of shortcomings in data collection and analysis:
* Users where blind to what other songs had been suggested.
* Data analysis was inefficient because participants did not always use the right spelling or entered songs in the right format

Collectively choosing a song has been a reoccurring task in my life, from choosing performance songs as part of a college vocal group to planning a playlist to play at a party. I created this tool to make that task a more intuitive and pleasant experience.

## Getting Started

After creating an account, you'll have the ability to create a poll. Upon filling out the form to generate your poll, you will receive a url with a unique poll id to share with potential participants. On the same page, you will also have the opportunity to populate the poll with songs. Not sure of what songs to include yet? Don't worry, you can always add more songs later from the shareable voting url.

Extra Notes:
* Do you think of the song title before the artist? Leave the artist blank and choosing an auto-suggest option will populate the artist field automatically.
* Want to change your vote? Returning to the voting page, you will find that songs that you voted for previously will still be checked!

## Fonts

- [Roboto](https://fonts.google.com/specimen/Roboto)
- [Lobster](https://fonts.google.com/specimen/Lobster)

## Built With

### Back-end

- [Node.js](https://nodejs.org/en/) - Server framework
- [Express](https://expressjs.com/) - Web framework
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Data population about music artists, albums, and tracks, directly from the Spotify Data Catalogue.

### Front-end

- [jQuery](https://jquery.com/) - Javascript library
- [Twitter Typeahead](https://twitter.github.io/typeahead.js/) - JavaScript library that provides a foundation for building typeaheads
- [Bootstrap](https://getbootstrap.com/) - Front-end component library.
