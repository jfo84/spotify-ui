import * as React from 'react';
import { Provider } from 'react-redux';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import TrackTable from './TrackTable';
import reducer from '.././reducers/app';
import { tracks } from '.././data';

describe('Track request flow', () => {
  let httpMock;
  let store;

  const initialState = {
    fetchingTracks: false,
    tracks: [],
    selectedTracks: []
  };

  const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

  beforeEach(() => {
    httpMock = new MockAdapter(axios);
    store = createStore(
      reducer,
      initialState,
      applyMiddleware(thunk)
    );
  });

  it('should fetch and render tracks', async () => {
    httpMock.onGet('https://api.spotify.com/v1/me/top/tracks').reply(200, {
      status: 'success',
      items: tracks
    });

    const wrapper = mount(<Provider store={store}><TrackTable/></Provider>);

    // Check that our table head renders
    expect(wrapper.find('.all-tracks-checkbox').exists()).toBe(true);

    await flushAllPromises();
    wrapper.update();

    let track, trackName, artistNames, albumName;

    track = wrapper.find('tr.track-row0');
    expect(track.exists()).toBe(true);

    trackName = track.find('td.track-name0');
    expect(trackName.text()).toBe('Foo It Up');

    artistNames = track.find('td.artist-names0');
    expect(artistNames.text()).toBe('Fooby, Barbie');

    albumName = track.find('td.album-name0');
    expect(albumName.text()).toBe('Hoppin Foos All Day');

    track = wrapper.find('tr.track-row1');
    expect(track.exists()).toBe(true);

    trackName = track.find('td.track-name1');
    expect(trackName.text()).toBe('Little Foos');

    artistNames = track.find('td.artist-names1');
    expect(artistNames.text()).toBe('Fooby, Barbie');

    albumName = track.find('td.album-name1');
    expect(albumName.text()).toBe('Hoppin Foos All Day');
  });
});