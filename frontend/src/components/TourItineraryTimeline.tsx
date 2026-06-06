import { imageUrl } from '../utils/format'

export type LichTrinhItem = {
  id?: number
  ngayThu?: number
  tieuDe?: string
  soBuaAn?: string
  hoatDongChinh?: string
  noiDungLines?: string[]
  noiDung?: string
  moTa?: string
  nghiDem?: string
  hinhAnh?: string
}

type TourItineraryTimelineProps = {
  lichTrinhs: LichTrinhItem[]
  tourImage?: string
}

export function TourItineraryTimeline({ lichTrinhs, tourImage }: TourItineraryTimelineProps) {
  if (!lichTrinhs.length) {
    return <p className="text-muted mb-0">Chưa có lịch trình chi tiết.</p>
  }

  return (
    <div className="itinerary-timeline-v2">
      {lichTrinhs.map((lich, idx) => (
        <div key={lich.id ?? lich.ngayThu ?? idx} className="itinerary-day-block">
          <div className="itinerary-pin">
            <i className="bi bi-geo-alt-fill" />
          </div>
          <div className="itinerary-card">
            <div className="itinerary-card-header">
              <div className="itinerary-card-header-text">
                <div className="itinerary-day-label">Ngày {lich.ngayThu ?? idx + 1}</div>
                <div className="itinerary-route">{lich.tieuDe}</div>
                {lich.soBuaAn && (
                  <div className="itinerary-meals">
                    <i className="bi bi-cup-hot me-1" />
                    <span>{lich.soBuaAn}</span>
                  </div>
                )}
              </div>
              <img
                className="itinerary-day-img"
                alt=""
                src={imageUrl(lich.hinhAnh ?? tourImage)}
              />
            </div>
            <div className="itinerary-card-body">
              {lich.hoatDongChinh && (
                <p className="itinerary-main-activity">
                  <strong>Hoạt động chính:</strong> <span>{lich.hoatDongChinh}</span>
                </p>
              )}
              {(lich.noiDungLines?.length ?? 0) > 0 && (
                <ul className="itinerary-activity-list">
                  {lich.noiDungLines!.map((line, lineIdx) => (
                    <li key={lineIdx}>{line}</li>
                  ))}
                </ul>
              )}
              {!lich.noiDungLines?.length && lich.moTa && (
                <p className="itinerary-main-activity">
                  <span>{lich.moTa}</span>
                </p>
              )}
              {!lich.noiDungLines?.length && !lich.moTa && lich.noiDung && (
                <p className="itinerary-main-activity">
                  <span>{lich.noiDung}</span>
                </p>
              )}
              {lich.nghiDem && (
                <p className="itinerary-sleep">
                  <i className="bi bi-moon-stars me-1" />
                  Nghỉ đêm tại <span>{lich.nghiDem}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
