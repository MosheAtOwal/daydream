import Selector from 'css-selector-generator'
import { threadId } from 'worker_threads';

const selector = new Selector()

class EventRecorder {

constructor() {
  const typeableElements = document.querySelectorAll('input, textarea')
    const clickableElements = document.querySelectorAll('a, button')
  this.elementsByRecordableEventType = {
    'click': clickableElements,
    'keydown': typeableElements
  }
}
  start () {
    const recordableDataAttribute = 'data-cy-recordable'
    
    const recordableElements = document.querySelectorAll(`[${recordableDataAttribute}]`)
    
    recordableElements.forEach((element) => {
      Set(element.getAttribute(recordableDataAttribute).split(',').map(event => event.trim())).forEach((event) => {
        this.addElementForEvent(element, event)
      })
    })

    const events = Object.keys(elementsByRecordableEventType)

    for (let i = 0; i < events.length; i++) {
      const eventType = events[i]
      const elements = elementsByRecordableEventType[eventType]
      elements.forEach(element => {
        const isClick = eventType === 'click'
        const isKeydown = eventType === 'keydown'
        const handler = (isClick ? this.handleClick : (isKeydown ? this.handleKeydown : this.handleEvent))
        
        element.addEventListener(eventType, handler)
      })

    }
  }
   addElementForEvent (element, event) {
    let elementsForEvent = elementsByRecordableEventType[event]

    if (!elementsForEvent) {
      elementsForEvent = [element]
    } else {
      elementsForEvent.push(element)
    }
    
    elementsByRecordableEventType[event] = elementsForEvent
  }
  
  handleKeydown (e) {
    if (e.keyCode !== 9) {
      return
    }
    this.handleEvent(e)
  }

  handleClick (e) {
    if (e.target.href) {
      chrome.runtime.sendMessage({
        action: 'url',
        value: e.target.href
      })
    }
    this.handleEvent(e)
  }

  handleEvent(e) {
    sendMessage(e)
  }
}

function sendMessage (e) {
  chrome.runtime.sendMessage({
    selector: selector.getSelector(e.target),
    value: e.target.value,
    action: e.type
  })
}

const eventRecorder = new EventRecorder()
eventRecorder.start()
