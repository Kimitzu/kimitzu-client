import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/react'
import { more } from 'ionicons/icons'
import React, { useState } from 'react'

interface Props {
  title?: string
}

const StoreMobileHeader = ({ title }: Props) => {
  const [showPopover, setShowPopover] = useState<boolean>(false)
  const [popoverEvent, setPopoverEvent] = useState()
  if (!isPlatform('mobile')) {
    return null
  }
  const handlePopover = (e: React.MouseEvent) => {
    setPopoverEvent(e.nativeEvent)
    setShowPopover(true)
  }
  const dismiss = () => {
    setShowPopover(false)
  }
  return (
    <IonHeader>
      <IonToolbar color="primary">
        {title ? <IonTitle className="uk-text-center">{title}</IonTitle> : null}
        <IonButtons slot="start">
          <div style={{ width: '46px' }} />
        </IonButtons>
        <IonButtons slot="end">
          <IonButton onClick={handlePopover}>
            <IonIcon size="large" icon={more} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={dismiss}>
        <IonList className="uk-padding-small uk-padding-remove-vertical">
          <IonItem
            button
            onClick={() => {
              window.location.hash = '/listing/create'
              dismiss()
            }}
          >
            <IonLabel>Create Listing</IonLabel>
          </IonItem>
          <IonItem
            button
            onClick={() => {
              window.location.hash = '/history/purchases'
              dismiss()
            }}
          >
            <IonLabel>Purchase History</IonLabel>
          </IonItem>
          <IonItem
            button
            onClick={() => {
              window.location.hash = '/history/sales'
              dismiss()
            }}
          >
            <IonLabel>Sales History</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </IonHeader>
  )
}

export default StoreMobileHeader
