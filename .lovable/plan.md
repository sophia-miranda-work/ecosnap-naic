I found why it feels invisible: the Vitamin D widget is currently nested inside the "Today's extras" component as a featured block, but it is not appearing in the live DOM. I’ll move it back out of that wrapper and render it directly underneath the "Start your walk" section, exactly where you want it.

Plan:
1. Update the home route so the order becomes:

```text
Walk stats
Start your walk
Daily vitamin D widget
Today's extras
```

2. Remove the `featured={<VitaminDCard />}` usage from `DailyExtras` so the widget is no longer dependent on the extras component rendering it.

3. Simplify `DailyExtras` by removing the now-unneeded `featured` prop support.

4. Make the Vitamin D widget visually harder to miss by keeping the sun icon in the header and giving the card a clear top margin directly under the Start button.

5. Verify in the preview that the page text includes "Daily vitamin D" / "Sun check setup" immediately after "Start your walk".