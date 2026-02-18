import AppKit

let outDir = "/Users/petr.vojtechovsky/Documents/New project/Tab-todo/ui-concepts"
let size = CGSize(width: 1200, height: 900)

func saveImage(_ image: NSImage, _ name: String) {
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { return }
    let url = URL(fileURLWithPath: outDir).appendingPathComponent(name)
    try? png.write(to: url)
}

func drawText(_ text: String, at point: CGPoint, size: CGFloat, weight: NSFont.Weight = .regular, color: NSColor = NSColor(calibratedWhite: 0.2, alpha: 1.0)) {
    let font = NSFont.systemFont(ofSize: size, weight: weight)
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color
    ]
    (text as NSString).draw(at: point, withAttributes: attrs)
}

func roundedRect(_ rect: CGRect, radius: CGFloat, color: NSColor) {
    color.setFill()
    NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius).fill()
}

func drawChip(_ text: String, rect: CGRect, active: Bool) {
    let bg = active ? NSColor(calibratedRed: 0.90, green: 0.95, blue: 1.0, alpha: 1.0) : NSColor(calibratedWhite: 0.96, alpha: 1.0)
    let fg = active ? NSColor(calibratedRed: 0.09, green: 0.32, blue: 0.75, alpha: 1.0) : NSColor(calibratedWhite: 0.35, alpha: 1.0)
    roundedRect(rect, radius: 14, color: bg)
    drawText(text, at: CGPoint(x: rect.minX + 18, y: rect.minY + 10), size: 15, weight: .semibold, color: fg)
}

func drawTask(_ y: CGFloat, title: String, subtitle: String, done: Bool, compact: Bool = false) {
    let h: CGFloat = compact ? 76 : 90
    roundedRect(CGRect(x: 190, y: y, width: 820, height: h), radius: 18, color: .white)
    NSColor(calibratedWhite: 0.90, alpha: 1.0).setStroke()
    NSBezierPath(roundedRect: CGRect(x: 190, y: y, width: 820, height: h), xRadius: 18, yRadius: 18).stroke()

    let checkbox = CGRect(x: 220, y: y + h/2 - 12, width: 24, height: 24)
    roundedRect(checkbox, radius: 12, color: done ? NSColor(calibratedRed: 0.13, green: 0.62, blue: 0.27, alpha: 1.0) : NSColor(calibratedWhite: 0.93, alpha: 1.0))
    if done {
        let p = NSBezierPath()
        NSColor.white.setStroke()
        p.move(to: CGPoint(x: checkbox.minX + 6, y: checkbox.minY + 12))
        p.line(to: CGPoint(x: checkbox.minX + 11, y: checkbox.minY + 6))
        p.line(to: CGPoint(x: checkbox.minX + 18, y: checkbox.minY + 17))
        p.lineWidth = 2.5
        p.lineCapStyle = .round
        p.lineJoinStyle = .round
        p.stroke()
    }

    drawText(title, at: CGPoint(x: 260, y: y + h - (compact ? 32 : 36)), size: compact ? 18 : 20, weight: .semibold, color: done ? NSColor(calibratedWhite: 0.55, alpha: 1.0) : NSColor(calibratedWhite: 0.16, alpha: 1.0))
    drawText(subtitle, at: CGPoint(x: 260, y: y + 18), size: compact ? 13 : 14, color: NSColor(calibratedWhite: 0.5, alpha: 1.0))
}

func makeConcept1() {
    let img = NSImage(size: size)
    img.lockFocus()
    roundedRect(CGRect(origin: .zero, size: size), radius: 0, color: NSColor(calibratedRed: 0.95, green: 0.96, blue: 0.98, alpha: 1.0))

    roundedRect(CGRect(x: 150, y: 60, width: 900, height: 780), radius: 30, color: NSColor(calibratedWhite: 0.98, alpha: 1.0))
    drawText("Concept A · Compact Cupertino", at: CGPoint(x: 190, y: 790), size: 24, weight: .bold)

    roundedRect(CGRect(x: 190, y: 736, width: 520, height: 44), radius: 12, color: .white)
    NSColor(calibratedWhite: 0.88, alpha: 1.0).setStroke()
    NSBezierPath(roundedRect: CGRect(x: 190, y: 736, width: 520, height: 44), xRadius: 12, yRadius: 12).stroke()
    drawText("Search tasks", at: CGPoint(x: 206, y: 748), size: 15, color: NSColor(calibratedWhite: 0.55, alpha: 1.0))

    drawChip("All", rect: CGRect(x: 730, y: 736, width: 80, height: 44), active: true)
    drawChip("Active", rect: CGRect(x: 818, y: 736, width: 96, height: 44), active: false)
    drawChip("Done", rect: CGRect(x: 922, y: 736, width: 88, height: 44), active: false)

    drawTask(620, title: "Landing page QA", subtitle: "https://example.com/product", done: false, compact: true)
    drawTask(530, title: "Billing dashboard", subtitle: "https://example.com/billing", done: false, compact: true)
    drawTask(440, title: "Weekly report", subtitle: "https://example.com/reports", done: true, compact: true)
    drawTask(350, title: "Help center update", subtitle: "https://example.com/help", done: false, compact: true)

    roundedRect(CGRect(x: 190, y: 285, width: 390, height: 46), radius: 14, color: NSColor(calibratedRed: 0.12, green: 0.48, blue: 0.95, alpha: 1.0))
    drawText("Add current tab as ToDo", at: CGPoint(x: 216, y: 299), size: 16, weight: .semibold, color: .white)

    roundedRect(CGRect(x: 590, y: 285, width: 180, height: 46), radius: 14, color: .white)
    drawText("Refresh", at: CGPoint(x: 648, y: 299), size: 16, weight: .semibold)

    roundedRect(CGRect(x: 780, y: 285, width: 230, height: 46), radius: 14, color: .white)
    drawText("Clear completed", at: CGPoint(x: 828, y: 299), size: 16, weight: .semibold, color: NSColor(calibratedRed: 0.75, green: 0.19, blue: 0.18, alpha: 1.0))

    img.unlockFocus()
    saveImage(img, "concept-a-compact-cupertino.png")
}

func makeConcept2() {
    let img = NSImage(size: size)
    img.lockFocus()
    roundedRect(CGRect(origin: .zero, size: size), radius: 0, color: NSColor(calibratedRed: 0.96, green: 0.97, blue: 0.98, alpha: 1.0))

    roundedRect(CGRect(x: 140, y: 50, width: 920, height: 800), radius: 36, color: .white)
    drawText("Concept B · Airy Glass", at: CGPoint(x: 190, y: 792), size: 24, weight: .bold)

    roundedRect(CGRect(x: 190, y: 720, width: 820, height: 66), radius: 22, color: NSColor(calibratedWhite: 0.97, alpha: 1.0))
    drawText("Add current tab as ToDo", at: CGPoint(x: 220, y: 742), size: 19, weight: .semibold)
    roundedRect(CGRect(x: 790, y: 732, width: 200, height: 42), radius: 14, color: NSColor(calibratedRed: 0.12, green: 0.48, blue: 0.95, alpha: 1.0))
    drawText("Add", at: CGPoint(x: 877, y: 745), size: 16, weight: .semibold, color: .white)

    drawChip("All", rect: CGRect(x: 190, y: 662, width: 110, height: 42), active: true)
    drawChip("Active", rect: CGRect(x: 310, y: 662, width: 120, height: 42), active: false)
    drawChip("Done", rect: CGRect(x: 440, y: 662, width: 110, height: 42), active: false)

    drawTask(542, title: "Design system tokens", subtitle: "apple.com/design/resources", done: false)
    drawTask(436, title: "Support flow polish", subtitle: "apple.com/support", done: false)
    drawTask(330, title: "Internal changelog", subtitle: "example.com/changelog", done: true)

    roundedRect(CGRect(x: 190, y: 250, width: 820, height: 54), radius: 16, color: NSColor(calibratedWhite: 0.97, alpha: 1.0))
    drawText("Close tab after adding", at: CGPoint(x: 220, y: 268), size: 17, weight: .medium)
    roundedRect(CGRect(x: 900, y: 262, width: 86, height: 30), radius: 15, color: NSColor(calibratedRed: 0.13, green: 0.62, blue: 0.27, alpha: 1.0))
    roundedRect(CGRect(x: 956, y: 264, width: 26, height: 26), radius: 13, color: .white)

    img.unlockFocus()
    saveImage(img, "concept-b-airy-glass.png")
}

func makeConcept3() {
    let img = NSImage(size: size)
    img.lockFocus()
    roundedRect(CGRect(origin: .zero, size: size), radius: 0, color: NSColor(calibratedWhite: 0.95, alpha: 1.0))

    roundedRect(CGRect(x: 120, y: 50, width: 960, height: 800), radius: 30, color: NSColor(calibratedWhite: 0.99, alpha: 1.0))
    roundedRect(CGRect(x: 120, y: 50, width: 250, height: 800), radius: 30, color: NSColor(calibratedWhite: 0.96, alpha: 1.0))

    drawText("Concept C · Sidebar Native", at: CGPoint(x: 410, y: 792), size: 24, weight: .bold)
    drawText("Tab ToDo", at: CGPoint(x: 160, y: 780), size: 24, weight: .bold)

    drawChip("All", rect: CGRect(x: 150, y: 708, width: 180, height: 42), active: true)
    drawChip("Active", rect: CGRect(x: 150, y: 656, width: 180, height: 42), active: false)
    drawChip("Done", rect: CGRect(x: 150, y: 604, width: 180, height: 42), active: false)

    roundedRect(CGRect(x: 390, y: 720, width: 660, height: 44), radius: 12, color: .white)
    NSColor(calibratedWhite: 0.88, alpha: 1.0).setStroke()
    NSBezierPath(roundedRect: CGRect(x: 390, y: 720, width: 660, height: 44), xRadius: 12, yRadius: 12).stroke()
    drawText("Search in tasks", at: CGPoint(x: 408, y: 732), size: 15, color: NSColor(calibratedWhite: 0.55, alpha: 1.0))

    drawTask(602, title: "Homepage SEO pass", subtitle: "example.com", done: false)
    drawTask(496, title: "Checkout bug triage", subtitle: "example.com/checkout", done: false)
    drawTask(390, title: "Release notes", subtitle: "example.com/releases", done: true)

    roundedRect(CGRect(x: 390, y: 290, width: 320, height: 50), radius: 14, color: NSColor(calibratedRed: 0.12, green: 0.48, blue: 0.95, alpha: 1.0))
    drawText("Add current tab", at: CGPoint(x: 470, y: 306), size: 17, weight: .semibold, color: .white)
    roundedRect(CGRect(x: 724, y: 290, width: 160, height: 50), radius: 14, color: .white)
    drawText("Refresh", at: CGPoint(x: 775, y: 306), size: 17, weight: .semibold)
    roundedRect(CGRect(x: 896, y: 290, width: 154, height: 50), radius: 14, color: .white)
    drawText("Clear done", at: CGPoint(x: 936, y: 306), size: 17, weight: .semibold, color: NSColor(calibratedRed: 0.75, green: 0.19, blue: 0.18, alpha: 1.0))

    img.unlockFocus()
    saveImage(img, "concept-c-sidebar-native.png")
}

makeConcept1()
makeConcept2()
makeConcept3()
print("Mockups generated in \(outDir)")
