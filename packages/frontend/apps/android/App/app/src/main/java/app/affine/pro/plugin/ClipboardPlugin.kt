package app.affine.pro.plugin

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "Clipboard")
class ClipboardPlugin : Plugin() {

    private val clipboardManager: ClipboardManager?
        get() = context?.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager

    @PluginMethod
    fun write(call: PluginCall) {
        val text = call.getString("text")
        val html = call.getString("html")
        if (text == null && html == null) {
            call.reject("Missing text or html parameter")
            return
        }

        val clip = when {
            html != null && text != null -> ClipData(
                "text",
                arrayOf(ClipDescription.MIMETYPE_TEXT_HTML, ClipDescription.MIMETYPE_TEXT_PLAIN),
                ClipData.Item(text, html)
            )
            html != null -> ClipData.newHtmlText("text", stripHtml(html), html)
            else -> ClipData.newPlainText("text", text)
        }

        // Mark the clip as coming from this app so other apps may trust it on Android 13+.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            clip.description.extras = PersistableBundle().apply {
                putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, false)
            }
        }

        clipboardManager?.setPrimaryClip(clip)
        call.resolve()
    }

    @PluginMethod
    fun read(call: PluginCall) {
        val clip = clipboardManager?.primaryClip
        if (clip == null || clip.itemCount == 0) {
            call.resolve(jsObject("text" to null, "html" to null))
            return
        }
        val item = clip.getItemAt(0)
        call.resolve(
            jsObject(
                "text" to item.coerceToText(context)?.toString(),
                "html" to item.htmlText
            )
        )
    }

    private fun stripHtml(html: String): String =
        html.replace(Regex("<[^>]*>"), "").trim()

    private fun jsObject(vararg pairs: Pair<String, String?>): com.getcapacitor.JSObject =
        com.getcapacitor.JSObject().apply {
            pairs.forEach { (key, value) ->
                if (value != null) put(key, value)
            }
        }
}
