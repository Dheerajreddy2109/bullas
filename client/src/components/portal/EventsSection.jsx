import CardCarousel from '../sections/CardCarousel.jsx'
import SectionBlock from '../sections/SectionBlock.jsx'
import EventCard from './EventCard.jsx'

// Village events as a sliding row of cards. The layout leaves this out when there are no events.
function EventsSection({ number, title, events = [] }) {
  return (
    <SectionBlock id="events" number={number} title={title} tone="pink">
      <CardCarousel label={title}>
        {events.map((event, index) => (
          <EventCard key={index} event={event} colourIndex={index} />
        ))}
      </CardCarousel>
    </SectionBlock>
  )
}

export default EventsSection
