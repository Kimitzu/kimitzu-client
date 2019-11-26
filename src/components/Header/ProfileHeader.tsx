import React from 'react'

import { Button } from '../Button'

import Profile from '../../models/Profile'

import config from '../../config'

import { localeInstance } from '../../i18n'

import './ProfileHeader.css'

interface ViewProfileInterface {
  profile: Profile
  isOwner: boolean
  handleFollowBtn: () => void
  handleBlockBtn: () => void
  handleMessageBtn: () => void
  isFollowing: boolean
  isBlocked: boolean
}

const ProfileHeader = ({
  profile,
  isOwner,
  isFollowing,
  isBlocked,
  handleMessageBtn,
  handleBlockBtn,
  handleFollowBtn,
}: ViewProfileInterface) => {
  const {
    profilePage,
    followButton,
    blockButton,
    profilePage: { tabTitles },
  } = localeInstance.get.localizations

  return (
    <div>
      <div id="cover-photo" className="uk-text-right">
        <div hidden={isOwner} className="uk-button-group">
          <Button
            id="header-btn"
            className="uk-button uk-button-small button-hover-change-text"
            data-hover={isFollowing ? followButton.followingBtnTip : followButton.followBtnText}
            onClick={handleFollowBtn}
          >
            <span>{isFollowing ? followButton.followingBtnText : followButton.followBtnText}</span>
          </Button>
          <Button id="header-btn" className="uk-button uk-button-small" onClick={handleMessageBtn}>
            {profilePage.messageBtnText}
          </Button>
          <Button
            id="header-btn"
            className="uk-button uk-button-small button-hover-change-text"
            data-hover={isBlocked ? blockButton.blockedBtnTip : blockButton.blockBtnText}
            onClick={handleBlockBtn}
          >
            <span>{isBlocked ? blockButton.blockedBtnText : blockButton.blockBtnText}</span>
          </Button>
        </div>
      </div>
      <div id="profile-header" className="uk-width-1-1">
        <div id="profile-header-picture">
          {profile.peerID ? (
            <img
              src={
                profile.avatarHashes.medium
                  ? `${config.openBazaarHost}/ob/images/${profile.avatarHashes.medium}`
                  : `${config.host}/images/user.svg`
              }
            />
          ) : (
            <div uk-spinner="ratio: 3" />
          )}
        </div>
        <div id="profile-header-tab">
          <div id="profile-header-name">
            <h3>{profile.name}</h3>
          </div>
          <ul data-uk-tab="connect: #container-profile">
            <li className="uk-active">
              <a href="#" id="tab-label">
                {tabTitles.profile}
              </a>
            </li>
            <li>
              <a href="#" id="tab-label">
                {tabTitles.store} <span id="label-number"> {profile.stats!.listingCount} </span>
              </a>
            </li>
            <li>
              <a href="#" id="tab-label">
                {tabTitles.ratings}
              </a>
            </li>
            <li>
              <a href="#" id="tab-label">
                {tabTitles.followers}{' '}
                <span id="label-number"> {profile.stats!.followerCount} </span>
              </a>
            </li>
            <li>
              <a href="#" id="tab-label">
                {tabTitles.following}{' '}
                <span id="label-number"> {profile.stats!.followingCount} </span>
              </a>
            </li>
            {isOwner ? (
              <>
                <li>
                  <a
                    id="tab-label"
                    onClick={() => {
                      window.location.hash = '/history/sales'
                    }}
                  >
                    {tabTitles.salesHistory}
                  </a>
                </li>
                <li>
                  <a
                    id="tab-label"
                    onClick={() => {
                      window.location.hash = '/history/purchases'
                    }}
                  >
                    {tabTitles.purchaseHistory}
                  </a>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
