import React, { useContext, useEffect, useState } from 'react'
import * as moment from 'moment'
import { TimerContext, VisualizationContext } from '../../../contexts'
import CalendarHeatMap from '../../../components/Charts/CalendarHeatMap'
import RadarChart from '../../../components/Charts/RadarChart'
import VisualizationBox from '../../../components/VisualizationBox'
import {
    getAudioFeatureYoYChangeSeries,
    getWeightedAudioFeaturesComparison,
} from '../../../queries/audio-features'
import { transformCountryCodeToFullName } from '../../../queries/region'
import TabGroup from '../../../components/TabGroup/TabGroup'

const TOGGLABLE_FEATURE_NAMES = [
    { key: 'valence', name: 'Valence' },
    { key: 'energy', name: 'Energy' },
    { key: 'danceability', name: 'Danceability' },
]
export default () => {
    const timerContext = useContext(TimerContext)
    const visualizationContext = useContext(VisualizationContext)

    const [selectedFeature, setSelectedFeature] = useState(
        TOGGLABLE_FEATURE_NAMES[0]
    )
    const [audioFeatureData, setAudioFeatureData] = useState([])
    const [currData, yearBeforeData] = audioFeatureData
    const [heatMapData, setHeatMapData] = useState({})

    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        getAudioFeatureYoYChangeSeries(
            visualizationContext.state.selectedRegion,
            selectedFeature.key,
            true
        ).then(setHeatMapData)
    }, [visualizationContext.state.selectedRegion, selectedFeature.key])

    useEffect(() => {
        getWeightedAudioFeaturesComparison(
            visualizationContext.state.selectedRegion,
            selectedDate || timerContext.currentDate
        ).then(setAudioFeatureData)
    }, [
        visualizationContext.state.selectedRegion,
        timerContext.currentDate,
        selectedDate,
    ])

    return (
        <VisualizationBox
            heading='h1'
            headingText='Audio Feature Analysis'
            headingId='audio-feature'
            subHeadingText='How positive/negative are those top songs in a country?'
        >
            <VisualizationBox
                heading='h2'
                headingText='Year-on-Year Change of Feature Score, 2020 vs. 2019'
                subtitle={
                    <>
                        The calendar heatmap shows the general trend of
                        Year-on-Year (YoY) change of some specific audio
                        features in
                        {transformCountryCodeToFullName(
                            visualizationContext.state.selectedRegion
                        )}
                        , including valence, energy and danceability, which we
                        believe to be key indicators of how positive the average
                        songs are that the people listen to in
                        {transformCountryCodeToFullName(
                            visualizationContext.state.selectedRegion
                        )}
                        . We greyed out positive YoY changes to emphasize
                        negative YoY changes, which indicate{' '}
                        <b>
                            an overall dip in positivity in the songs that
                            people are listening to{' '}
                        </b>
                        on a specific date, as compared to one year ago. The
                        darker the{' '}
                        <span className='bg-red-600 text-white'>red</span> is,
                        the more negativity the top songs reflect.
                    </>
                }
            >
                <TabGroup
                    group={TOGGLABLE_FEATURE_NAMES}
                    selected={selectedFeature}
                    onClick={setSelectedFeature}
                />
                <CalendarHeatMap
                    startDate={new Date(2020, 0, 1)}
                    data={heatMapData}
                    color='red'
                    onClickDate={(date) => {
                        setSelectedDate(moment(date))
                    }}
                />
            </VisualizationBox>
            <VisualizationBox
                heading='h2'
                headingText='Day-specific Audio Feature Comparison'
                subHeadingText='On a scale from 0 to 1'
                subtitle='The radar chart above shows the weighted average audio feature of the top songs on a specific date with a comparison of what it looked like exactly one year ago.'
            >
                {selectedDate && (
                    <button
                        className='focus:outline-none block pt-2 pb-2 pl-3 pr-3 rounded-sm bg-green-400 text-white font-bold uppercase'
                        type='button'
                        onClick={() => setSelectedDate(null)}
                    >
                        Reset date
                    </button>
                )}
                {audioFeatureData.length > 0 && (
                    <div className='m-2 flex justify-around items-center h-auto w-full'>
                        <div className='flex flex-col items-center'>
                            <RadarChart
                                round
                                level={3}
                                max={1}
                                margin={100}
                                data={[currData]}
                                colors={['#EDC951']}
                                className='inline-block h-64'
                            />
                            <span className='text-sm'>
                                {(
                                    selectedDate || timerContext.currentDate
                                ).format('MMM D YYYY')}
                            </span>
                        </div>
                        <div className='flex flex-col items-center'>
                            <RadarChart
                                round
                                level={3}
                                max={1}
                                margin={100}
                                data={[yearBeforeData]}
                                colors={['#00A0B0']}
                                className='inline-block h-64'
                            />
                            <span className='text-sm'>
                                {(selectedDate || timerContext.currentDate)
                                    .clone()
                                    .add(-1, 'year')
                                    .format('MMM D YYYY')}
                            </span>
                        </div>
                    </div>
                )}
            </VisualizationBox>
        </VisualizationBox>
    )
}
