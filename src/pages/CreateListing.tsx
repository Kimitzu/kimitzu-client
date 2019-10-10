import React, { Component, ReactNode } from 'react'
import { RouteComponentProps } from 'react-router'
import { SideMenuWithContentCard } from '../components/Card'
import {
  AddressForm,
  ListingCouponsForm,
  ListingCryptoCurrenciesForm,
  ListingGeneralForm,
  ListingPhotosForm,
  ListingTermsAndConditionsForm,
  ModeratorSelectionForm,
  ShippingOptionForm,
  TagsForm,
} from '../components/Form'
import { ModeratorInfoModal } from '../components/Modal'
import CryptoCurrencies from '../constants/CryptoCurrencies'
import Listing from '../models/Listing'
import Profile from '../models/Profile'
import Settings from '../models/Settings'
import ImageUploaderInstance from '../utils/ImageUploaderInstance'
import PlusCode from '../utils/Location/PlusCode'
import NestedJSONUpdater from '../utils/NestedJSONUpdater'

const cryptoCurrenciesConstants = [...CryptoCurrencies()]
cryptoCurrenciesConstants.splice(0, 1)
const cryptoCurrencies = cryptoCurrenciesConstants.map(crypto => crypto.value)

interface CardContent {
  component: ReactNode
  title: string
}

interface RouteParams {
  id: string
}

interface CreateListingProps extends RouteComponentProps<RouteParams> {
  currentUser: Profile
}

interface CreateListingState {
  listing: Listing
  currentUser: Profile
  currentFormIndex: number
  tempImages: string[]
  isLoading: boolean
  selectedModerator: Profile
  availableModerators: Profile[]
  selectedModerators: Profile[]
  originalModerators: Profile[]
  hasFetchedAModerator: boolean
  isListingNew: boolean
  [key: string]: any
}

class CreateListing extends Component<CreateListingProps, CreateListingState> {
  constructor(props: CreateListingProps) {
    super(props)
    const listing = new Listing()
    const profile = this.props.currentUser

    this.state = {
      currentUser: profile,
      currentFormIndex: 0,
      tempImages: [],
      isLoading: false,
      hasFetchedAModerator: true,
      isListingNew: true,
      // === Formal Schema
      listing,
      selectedModerator: new Profile(),
      originalModerators: [],
      // === TODO: Implement handlers
      shippingOptions: {
        destination: '',
        optionTitle: '',
        type: '',
        shippingServices: [
          {
            name: '',
            deliveryTime: '',
            price: 0,
            priceAddtl: 0,
          },
        ],
      },
      availableModerators: [],
      selectedModerators: [],
    }
    this.handleAddCoupons = this.handleAddCoupons.bind(this)
    this.handleAddShippingService = this.handleAddShippingService.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmitForm = this.handleSubmitForm.bind(this)
    this.handleFullSubmit = this.handleFullSubmit.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleRemoveRow = this.handleRemoveRow.bind(this)
    this.handleSubmitModeratorSelection = this.handleSubmitModeratorSelection.bind(this)
    this.handleModeratorSelection = this.handleModeratorSelection.bind(this)
    this.handleShowModeratorModal = this.handleShowModeratorModal.bind(this)
    this.handleModeratorSearch = this.handleModeratorSearch.bind(this)
  }

  public async componentDidMount() {
    const id = this.props.match.params.id

    if (id) {
      const { listing, imageData } = await Listing.retrieve(id)

      if (!listing.isOwner) {
        window.UIkit.notification('Unable to edit listing that you do not own!', {
          status: 'warning',
        })
        window.location.hash = '/'
        return
      }

      const images = imageData.map(img => img.src)
      this.setState({
        listing,
        tempImages: images,
        isListingNew: false,
      })
    } else {
      const listing = { ...this.state.listing }
      listing.metadata.acceptedCurrencies = [...cryptoCurrencies]
    }

    const profile = this.props.currentUser
    const settings = await Settings.retrieve()
    const moderatorProfilesRequest = settings.storeModerators.map(moderator =>
      Profile.retrieve(moderator)
    )
    const moderatorProfiles = await Promise.all(moderatorProfilesRequest)

    this.setState({
      currentUser: profile,
      availableModerators: moderatorProfiles,
      originalModerators: moderatorProfiles,
    })
  }

  get contents() {
    const { availableModerators, selectedModerators, hasFetchedAModerator } = this.state
    const {
      handleInputChange,
      handleSubmitForm,
      handleRemoveRow,
      handleAddShippingService,
      handleShowModeratorModal,
      handleSubmitModeratorSelection,
      handleAddCoupons,
    } = this
    return [
      {
        component: (
          <ListingGeneralForm
            key={this.state.listing.metadata.serviceClassification}
            data={this.state.listing}
            handleContinue={handleSubmitForm}
            isNew={this.state.isListingNew}
            handleFullSubmit={this.handleFullSubmit}
          />
        ),
        title: 'General',
      },
      {
        component: (
          <AddressForm
            data={this.state.listing.location}
            isListing
            handleSave={location => {
              this.state.listing.location = location
              handleSubmitForm()
            }}
            isNew={this.state.isListingNew}
            handleFullSubmit={this.handleFullSubmit}
          />
        ),
        title: 'Location',
      },
      {
        component: (
          <ListingPhotosForm
            handleContinue={handleSubmitForm}
            images={this.state.tempImages}
            onChange={images => {
              this.setState({
                tempImages: [...images],
              })
            }}
            isNew={this.state.isListingNew}
            handleFullSubmit={this.handleFullSubmit}
          />
        ),
        title: 'Photos',
      },
      // {
      //   component: (
      //     <ShippingOptionForm
      //       data={this.state.shippingOptions}
      //       handleAddShippingService={handleAddShippingService}
      //       handleContinue={handleSubmitForm}
      //       handleInputChange={handleInputChange}
      //       disabled={this.state.listing.metadata.contractType === 'SERVICE'}
      //     />
      //   ),
      //   title: 'Shipping',
      // },
      {
        component: (
          <div className="uk-flex uk-flex-column uk-width-1-1">
            <div className="uk-alert-primary uk-padding-small uk-margin-bottom">
              Use tags to enhance search visibility of your listing.
            </div>
            <TagsForm
              onSubmit={tags => {
                const listing = this.state.listing
                listing.item.tags = tags
                this.setState({
                  listing,
                })
                this.handleSubmitForm()
              }}
              tags={this.state.listing.item.tags}
              isNew={this.state.isListingNew}
              handleFullSubmit={this.handleFullSubmit}
            />
          </div>
        ),
        title: 'Tags',
      },
      {
        component: (
          <div className="uk-flex uk-flex-column uk-width-1-1">
            {availableModerators.length <= 0 && selectedModerators.length <= 0 ? (
              <div className="uk-alert-warning uk-padding-small uk-margin-bottom" uk-alert>
                It seems like you have no moderators setup.
                <br />
                Review moderators in the{' '}
                <a
                  href="#"
                  onClick={event => {
                    event.preventDefault()
                    window.location.hash = '/settings'
                  }}
                >
                  settings page
                </a>
                .
              </div>
            ) : null}
            <ModeratorSelectionForm
              availableModerators={availableModerators}
              selectedModerators={selectedModerators}
              handleBtnClick={this.handleModeratorSelection}
              handleSubmit={handleSubmitModeratorSelection}
              handleModeratorSearch={this.handleModeratorSearch}
              handleMoreInfo={handleShowModeratorModal}
              showSpinner={!hasFetchedAModerator}
              isNew={this.state.isListingNew}
              handleFullSubmit={this.handleFullSubmit}
              isListing
            />
          </div>
        ),
        title: 'Moderators',
      },
      {
        component: (
          <ListingTermsAndConditionsForm
            handleInputChange={handleInputChange}
            handleContinue={handleSubmitForm}
            termsAndConditions={this.state.listing.termsAndConditions}
            isNew={this.state.isListingNew}
            handleFullSubmit={this.handleFullSubmit}
          />
        ),
        title: 'Terms and Conditions',
      },
      {
        component: (
          <ListingCouponsForm
            coupons={this.state.listing.coupons}
            handleAddCoupon={handleAddCoupons}
            handleContinue={handleSubmitForm}
            handleInputChange={handleInputChange}
            handleRemoveRow={handleRemoveRow}
            isNew={this.state.isListingNew}
            handleFullSubmit={this.handleFullSubmit}
          />
        ),
        title: 'Coupons',
      },
      {
        component: (
          <ListingCryptoCurrenciesForm
            handleContinue={this.handleFullSubmit}
            handleInputChange={handleInputChange}
            acceptedCurrencies={this.state.listing.metadata.acceptedCurrencies}
            isLoading={this.state.isLoading}
            isNew={this.state.isListingNew}
          />
        ),
        title: 'Accepted Currencies',
      },
    ]
  }

  get navItems() {
    return this.contents.map((content: CardContent, index: number) => {
      return {
        label: content.title,
        handler: () => {
          this.setState({ currentFormIndex: index })
        },
      }
    })
  }

  get currentForm() {
    const { currentFormIndex } = this.state
    return this.contents[currentFormIndex]
  }

  public handleAddressChange(field: string, value: string | string[]) {
    this.handleInputChange(`location.${field}`, value, 'listing')
  }

  public handleInputChange(field: string, value: any, parentField?: string) {
    if (parentField) {
      const subFieldData = this.state[parentField]
      if (field === 'location.plusCode') {
        if (PlusCode.isValid(value)) {
          const plusCodeBounds = PlusCode.decode(value)
          const { longitudeCenter, latitudeCenter } = plusCodeBounds
          NestedJSONUpdater(subFieldData, 'location.latitude', latitudeCenter.toString())
          NestedJSONUpdater(subFieldData, 'location.longitude', longitudeCenter.toString())
        }
      }
      NestedJSONUpdater(subFieldData, field, value)
      this.setState({ ...this.state })
    } else {
      this.setState({
        [field]: value,
      })
    }
  }

  public handleSubmitForm(event?: React.FormEvent) {
    if (event) {
      event.preventDefault()
    }
    this.setState({
      currentFormIndex: this.state.currentFormIndex + 1,
    })
  }

  // TODO: Handle properly
  public handleAddShippingService() {
    const tempShippingService = {
      name: '',
      deliveryTime: '',
      price: 0,
      priceAddtl: 0,
    }
    const shippingOptions = this.state.shippingOptions
    shippingOptions.shippingServices = [...shippingOptions.shippingServices, tempShippingService]
    this.setState({ shippingOptions })
  }

  public handleAddCoupons() {
    this.state.listing.addCoupon()
    this.setState({
      listing: this.state.listing,
    })
  }

  public async handleFullSubmit(event: React.FormEvent) {
    event.preventDefault()
    const listing = this.state.listing

    this.setState({
      isLoading: true,
    })

    const newImages = this.state.tempImages.filter(image => !image.startsWith('http'))
    const imageUpload = newImages.map(base64Image => ImageUploaderInstance.uploadImage(base64Image))
    const updateOldImages = this.state.listing.item.images.filter(oldElements => {
      return this.state.tempImages.find(updatedElements => {
        const id = updatedElements.split('/')
        return oldElements.medium === id[id.length - 1]
      })
    })

    try {
      const images = await Promise.all(imageUpload)
      listing.item.images = [...updateOldImages, ...images]
      if (this.state.isListingNew) {
        await listing.save()
        window.UIkit.notification('Listing Successfully Posted', {
          status: 'success',
        })
      } else {
        await listing.update()
        window.UIkit.notification('Listing Successfully Updated', {
          status: 'success',
        })
      }
      await this.state.currentUser.crawlOwnListings()
      setTimeout(() => {
        window.location.hash = '/'
      }, 2000)
    } catch (e) {
      window.UIkit.notification(e.message, {
        status: 'danger',
      })
      this.setState({
        isLoading: false,
      })
    }

    this.setState({
      isLoading: false,
    })
  }

  public render() {
    const { navItems, currentForm } = this
    const { selectedModerator } = this.state
    return (
      <div className="background-body full-vh uk-padding-small">
        <SideMenuWithContentCard
          mainContentTitle={currentForm.title}
          menuContent={{
            title: this.state.isListingNew ? 'CREATE LISTING' : 'UPDATE LISTING',
            navItems,
          }}
          mainContent={currentForm.component}
          currentNavIndex={this.state.currentFormIndex}
        />
        <ModeratorInfoModal profile={selectedModerator} />
      </div>
    )
  }

  private handleRemoveRow(type: string, index: number) {
    const { listing } = this.state
    if (type === 'coupon') {
      listing.removeCoupon(index)
    }
    this.setState({ listing })
  }

  private handleModeratorSelection(moderator: Profile, index: number, type) {
    const { availableModerators, selectedModerators } = this.state
    if (type === 'add') {
      availableModerators.splice(index, 1)
      selectedModerators.push(moderator)
    } else if (type === 'remove') {
      selectedModerators.splice(index, 1)
      availableModerators.push(moderator)
    }
    this.setState({ availableModerators, selectedModerators })
  }

  private handleSubmitModeratorSelection() {
    const { listing, selectedModerators, currentFormIndex } = this.state
    listing.moderators = selectedModerators.map(moderator => moderator.peerID)
    this.setState({
      listing,
      currentFormIndex: currentFormIndex + 1,
    })
  }

  private handleShowModeratorModal(moderator: Profile) {
    this.setState({ selectedModerator: moderator })
    const moderatorModal = window.UIkit.modal('#moderator-info')
    if (moderatorModal) {
      moderatorModal.show()
    }
  }

  private async handleModeratorSearch(searchStr: string) {
    if (!searchStr) {
      this.setState({
        availableModerators: this.state.originalModerators,
      })
      return
    }

    if (this.state.availableModerators.length > 0) {
      const filteredMods = this.state.availableModerators.filter(mod => {
        return mod.peerID.includes(searchStr)
      })
      this.setState({
        availableModerators: filteredMods,
      })
      return
    }

    if (searchStr.length < 46) {
      return
    }

    const retrievedProfile = await Profile.retrieve(searchStr, true)
    const isAlreadySelected = this.state.selectedModerators.some(
      moderator => moderator.peerID === retrievedProfile.peerID
    )
    if (retrievedProfile.moderator && !isAlreadySelected) {
      this.setState({
        availableModerators: [retrievedProfile],
      })
    }
  }
}

export default CreateListing
